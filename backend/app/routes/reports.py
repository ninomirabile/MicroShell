"""
Reports routes for generating and managing reports.
Provides endpoints for report generation, data export, and PDF creation.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import Optional, List
from datetime import datetime, timedelta
import io
import csv
import json

from ..database import get_db
from ..models.user import User
from ..models.metrics import Metric
from ..models.logs import Log
from ..schemas.metrics import MetricResponse
from ..schemas.logs import LogResponse
from ..services.auth_service import get_current_user

router = APIRouter()

@router.get("/metrics-summary")
async def get_metrics_summary_report(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    type_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate metrics summary report with aggregated data.
    """
    # Default date range (last 30 days)
    if not date_from:
        date_from = datetime.utcnow() - timedelta(days=30)
    if not date_to:
        date_to = datetime.utcnow()
    
    query = db.query(Metric).filter(
        and_(
            Metric.recorded_at >= date_from,
            Metric.recorded_at <= date_to
        )
    )
    
    if type_filter:
        query = query.filter(Metric.type == type_filter)
    
    # Get basic statistics
    total_metrics = query.count()
    
    # Aggregate by type
    type_aggregation = db.query(
        Metric.type,
        func.count(Metric.id).label('count'),
        func.avg(Metric.value).label('avg_value'),
        func.min(Metric.value).label('min_value'),
        func.max(Metric.value).label('max_value'),
        func.sum(Metric.value).label('total_value')
    ).filter(
        and_(
            Metric.recorded_at >= date_from,
            Metric.recorded_at <= date_to
        )
    )
    
    if type_filter:
        type_aggregation = type_aggregation.filter(Metric.type == type_filter)
    
    type_stats = type_aggregation.group_by(Metric.type).all()
    
    # Get daily trends
    daily_trends = db.query(
        func.date(Metric.recorded_at).label('date'),
        func.count(Metric.id).label('count'),
        func.avg(Metric.value).label('avg_value')
    ).filter(
        and_(
            Metric.recorded_at >= date_from,
            Metric.recorded_at <= date_to
        )
    )
    
    if type_filter:
        daily_trends = daily_trends.filter(Metric.type == type_filter)
    
    daily_data = daily_trends.group_by(func.date(Metric.recorded_at)).order_by(func.date(Metric.recorded_at)).all()
    
    # Get top sources
    top_sources = db.query(
        Metric.source,
        func.count(Metric.id).label('count')
    ).filter(
        and_(
            Metric.recorded_at >= date_from,
            Metric.recorded_at <= date_to
        )
    )
    
    if type_filter:
        top_sources = top_sources.filter(Metric.type == type_filter)
    
    source_stats = top_sources.group_by(Metric.source).order_by(desc(func.count(Metric.id))).limit(10).all()
    
    return {
        "report_info": {
            "generated_at": datetime.utcnow().isoformat(),
            "date_from": date_from.isoformat(),
            "date_to": date_to.isoformat(),
            "type_filter": type_filter,
            "generated_by": current_user.username
        },
        "summary": {
            "total_metrics": total_metrics,
            "date_range_days": (date_to - date_from).days
        },
        "type_statistics": [
            {
                "type": stat.type,
                "count": stat.count,
                "avg_value": round(float(stat.avg_value or 0), 2),
                "min_value": float(stat.min_value or 0),
                "max_value": float(stat.max_value or 0),
                "total_value": float(stat.total_value or 0)
            }
            for stat in type_stats
        ],
        "daily_trends": [
            {
                "date": trend.date.isoformat(),
                "count": trend.count,
                "avg_value": round(float(trend.avg_value or 0), 2)
            }
            for trend in daily_data
        ],
        "top_sources": [
            {
                "source": source.source or "Unknown",
                "count": source.count
            }
            for source in source_stats
        ]
    }

@router.get("/user-activity")
async def get_user_activity_report(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate user activity report based on logs and metrics.
    """
    # Default date range (last 30 days)
    if not date_from:
        date_from = datetime.utcnow() - timedelta(days=30)
    if not date_to:
        date_to = datetime.utcnow()
    
    # User registration trends
    user_registrations = db.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(
        and_(
            User.created_at >= date_from,
            User.created_at <= date_to
        )
    ).group_by(func.date(User.created_at)).order_by(func.date(User.created_at)).all()
    
    # User login activity (from logs)
    login_activity = db.query(
        func.date(Log.created_at).label('date'),
        func.count(Log.id).label('count')
    ).filter(
        and_(
            Log.category == "auth",
            Log.message.ilike("%login%"),
            Log.created_at >= date_from,
            Log.created_at <= date_to
        )
    ).group_by(func.date(Log.created_at)).order_by(func.date(Log.created_at)).all()
    
    # Active users by role
    users_by_role = db.query(
        func.coalesce(func.nullif(db.query(Role.name).filter(Role.id == User.role_id).scalar_subquery(), ''), 'No Role').label('role'),
        func.count(User.id).label('count')
    ).filter(User.is_active == True).group_by(User.role_id).all()
    
    # User status distribution
    user_status = db.query(
        User.is_active,
        User.is_verified,
        func.count(User.id).label('count')
    ).group_by(User.is_active, User.is_verified).all()
    
    return {
        "report_info": {
            "generated_at": datetime.utcnow().isoformat(),
            "date_from": date_from.isoformat(),
            "date_to": date_to.isoformat(),
            "generated_by": current_user.username
        },
        "registration_trends": [
            {
                "date": reg.date.isoformat(),
                "count": reg.count
            }
            for reg in user_registrations
        ],
        "login_activity": [
            {
                "date": login.date.isoformat(),
                "count": login.count
            }
            for login in login_activity
        ],
        "users_by_role": [
            {
                "role": role.role,
                "count": role.count
            }
            for role in users_by_role
        ],
        "user_status_distribution": [
            {
                "is_active": status.is_active,
                "is_verified": status.is_verified,
                "count": status.count
            }
            for status in user_status
        ]
    }

@router.get("/system-health")
async def get_system_health_report(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate system health report based on logs and system metrics.
    """
    # Default date range (last 7 days)
    if not date_from:
        date_from = datetime.utcnow() - timedelta(days=7)
    if not date_to:
        date_to = datetime.utcnow()
    
    # Error logs analysis
    error_logs = db.query(
        Log.level,
        func.count(Log.id).label('count')
    ).filter(
        and_(
            Log.created_at >= date_from,
            Log.created_at <= date_to,
            Log.level.in_(['error', 'critical', 'warning'])
        )
    ).group_by(Log.level).all()
    
    # System performance metrics
    performance_metrics = db.query(
        func.avg(Metric.value).label('avg_value'),
        func.min(Metric.value).label('min_value'),
        func.max(Metric.value).label('max_value')
    ).filter(
        and_(
            Metric.type == "performance",
            Metric.recorded_at >= date_from,
            Metric.recorded_at <= date_to
        )
    ).first()
    
    # System metrics trends
    system_trends = db.query(
        func.date(Metric.recorded_at).label('date'),
        func.avg(Metric.value).label('avg_value')
    ).filter(
        and_(
            Metric.type == "system",
            Metric.recorded_at >= date_from,
            Metric.recorded_at <= date_to
        )
    ).group_by(func.date(Metric.recorded_at)).order_by(func.date(Metric.recorded_at)).all()
    
    # Recent critical errors
    critical_errors = db.query(Log).filter(
        and_(
            Log.level == "critical",
            Log.created_at >= date_from,
            Log.created_at <= date_to
        )
    ).order_by(desc(Log.created_at)).limit(10).all()
    
    return {
        "report_info": {
            "generated_at": datetime.utcnow().isoformat(),
            "date_from": date_from.isoformat(),
            "date_to": date_to.isoformat(),
            "generated_by": current_user.username
        },
        "error_summary": [
            {
                "level": error.level,
                "count": error.count
            }
            for error in error_logs
        ],
        "performance_summary": {
            "avg_performance": round(float(performance_metrics.avg_value or 0), 2),
            "min_performance": float(performance_metrics.min_value or 0),
            "max_performance": float(performance_metrics.max_value or 0)
        } if performance_metrics else None,
        "system_trends": [
            {
                "date": trend.date.isoformat(),
                "avg_value": round(float(trend.avg_value or 0), 2)
            }
            for trend in system_trends
        ],
        "critical_errors": [
            {
                "id": error.id,
                "message": error.message,
                "source": error.source,
                "created_at": error.created_at.isoformat()
            }
            for error in critical_errors
        ]
    }

@router.get("/export/csv")
async def export_metrics_csv(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    type_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export metrics data as CSV file.
    """
    # Default date range (last 30 days)
    if not date_from:
        date_from = datetime.utcnow() - timedelta(days=30)
    if not date_to:
        date_to = datetime.utcnow()
    
    query = db.query(Metric).filter(
        and_(
            Metric.recorded_at >= date_from,
            Metric.recorded_at <= date_to
        )
    )
    
    if type_filter:
        query = query.filter(Metric.type == type_filter)
    
    metrics = query.order_by(Metric.recorded_at).all()
    
    # Create CSV content
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'ID', 'Name', 'Type', 'Value', 'Unit', 'Description',
        'Source', 'Recorded At', 'Created At'
    ])
    
    # Write data rows
    for metric in metrics:
        writer.writerow([
            metric.id,
            metric.name,
            metric.type,
            metric.value,
            metric.unit or '',
            metric.description or '',
            metric.source or '',
            metric.recorded_at.isoformat(),
            metric.created_at.isoformat()
        ])
    
    # Prepare response
    csv_content = output.getvalue()
    output.close()
    
    filename = f"metrics_export_{date_from.strftime('%Y%m%d')}_{date_to.strftime('%Y%m%d')}.csv"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/json")
async def export_metrics_json(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    type_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export metrics data as JSON file.
    """
    # Default date range (last 30 days)
    if not date_from:
        date_from = datetime.utcnow() - timedelta(days=30)
    if not date_to:
        date_to = datetime.utcnow()
    
    query = db.query(Metric).filter(
        and_(
            Metric.recorded_at >= date_from,
            Metric.recorded_at <= date_to
        )
    )
    
    if type_filter:
        query = query.filter(Metric.type == type_filter)
    
    metrics = query.order_by(Metric.recorded_at).all()
    
    # Convert to JSON-serializable format
    export_data = {
        "export_info": {
            "generated_at": datetime.utcnow().isoformat(),
            "date_from": date_from.isoformat(),
            "date_to": date_to.isoformat(),
            "type_filter": type_filter,
            "total_records": len(metrics),
            "generated_by": current_user.username
        },
        "metrics": [
            {
                "id": metric.id,
                "name": metric.name,
                "type": metric.type,
                "value": metric.value,
                "unit": metric.unit,
                "description": metric.description,
                "source": metric.source,
                "tags": metric.tags,
                "recorded_at": metric.recorded_at.isoformat(),
                "created_at": metric.created_at.isoformat(),
                "created_by": metric.created_by
            }
            for metric in metrics
        ]
    }
    
    json_content = json.dumps(export_data, indent=2)
    filename = f"metrics_export_{date_from.strftime('%Y%m%d')}_{date_to.strftime('%Y%m%d')}.json"
    
    return Response(
        content=json_content,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/templates")
async def get_report_templates(
    current_user: User = Depends(get_current_user)
):
    """
    Get available report templates.
    """
    templates = [
        {
            "id": "metrics_summary",
            "name": "Metrics Summary Report",
            "description": "Comprehensive metrics analysis with aggregations and trends",
            "parameters": ["date_from", "date_to", "type_filter"]
        },
        {
            "id": "user_activity",
            "name": "User Activity Report",
            "description": "User registration, login activity, and role distribution",
            "parameters": ["date_from", "date_to"]
        },
        {
            "id": "system_health",
            "name": "System Health Report",
            "description": "System performance, error logs, and health metrics",
            "parameters": ["date_from", "date_to"]
        }
    ]
    
    return {"templates": templates} 