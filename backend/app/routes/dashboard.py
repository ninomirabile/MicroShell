"""
Dashboard routes for metrics and analytics data.
Provides endpoints for dashboard microfrontend to display KPIs and metrics.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from datetime import datetime, timedelta
import random

from ..database import get_db
from ..models.user import User
from ..models.metrics import Metric
from ..schemas.metrics import MetricCreate, MetricUpdate, MetricResponse, MetricListResponse, DashboardSummary
from ..services.auth_service import get_current_user

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard summary with key metrics and KPIs.
    """
    # Get user statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # Get revenue metrics (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    revenue_metrics = db.query(func.sum(Metric.value)).filter(
        Metric.type == "revenue",
        Metric.recorded_at >= thirty_days_ago
    ).scalar() or 0.0
    
    # Get performance score (average of performance metrics)
    performance_score = db.query(func.avg(Metric.value)).filter(
        Metric.type == "performance",
        Metric.recorded_at >= thirty_days_ago
    ).scalar() or 0.0
    
    # Determine system health based on recent error logs and performance
    system_health = "healthy"
    if performance_score < 70:
        system_health = "warning"
    elif performance_score < 50:
        system_health = "critical"
    
    # Get recent metrics (last 10)
    recent_metrics = db.query(Metric).order_by(desc(Metric.recorded_at)).limit(10).all()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_revenue": revenue_metrics,
        "performance_score": round(performance_score, 2),
        "system_health": system_health,
        "recent_metrics": recent_metrics
    }

@router.get("/metrics", response_model=MetricListResponse)
async def get_metrics(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    type_filter: Optional[str] = None,
    source_filter: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get paginated list of metrics with filters.
    """
    query = db.query(Metric)
    
    # Apply filters
    if type_filter:
        query = query.filter(Metric.type == type_filter)
    
    if source_filter:
        query = query.filter(Metric.source == source_filter)
    
    if date_from:
        query = query.filter(Metric.recorded_at >= date_from)
    
    if date_to:
        query = query.filter(Metric.recorded_at <= date_to)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    offset = (page - 1) * per_page
    metrics = query.order_by(desc(Metric.recorded_at)).offset(offset).limit(per_page).all()
    
    # Calculate pagination info
    import math
    total_pages = math.ceil(total / per_page)
    has_next = page < total_pages
    has_prev = page > 1
    
    return {
        "metrics": metrics,
        "total": total,
        "page": page,
        "per_page": per_page,
        "has_next": has_next,
        "has_prev": has_prev
    }

@router.post("/metrics", response_model=MetricResponse)
async def create_metric(
    metric_data: MetricCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new metric entry.
    """
    new_metric = Metric(
        name=metric_data.name,
        type=metric_data.type,
        value=metric_data.value,
        unit=metric_data.unit,
        description=metric_data.description,
        source=metric_data.source,
        tags=metric_data.tags,
        recorded_at=metric_data.recorded_at or datetime.utcnow(),
        created_by=current_user.id
    )
    
    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)
    
    return new_metric

@router.get("/metrics/{metric_id}", response_model=MetricResponse)
async def get_metric(
    metric_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get specific metric by ID.
    """
    metric = db.query(Metric).filter(Metric.id == metric_id).first()
    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Metric not found"
        )
    return metric

@router.put("/metrics/{metric_id}", response_model=MetricResponse)
async def update_metric(
    metric_id: int,
    metric_data: MetricUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update existing metric.
    """
    metric = db.query(Metric).filter(Metric.id == metric_id).first()
    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Metric not found"
        )
    
    # Update metric fields
    update_data = metric_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(metric, field, value)
    
    db.commit()
    db.refresh(metric)
    
    return metric

@router.delete("/metrics/{metric_id}")
async def delete_metric(
    metric_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete metric by ID.
    """
    metric = db.query(Metric).filter(Metric.id == metric_id).first()
    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Metric not found"
        )
    
    db.delete(metric)
    db.commit()
    
    return {"message": "Metric deleted successfully"}

@router.get("/charts/performance")
async def get_performance_chart_data(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get performance metrics for chart visualization.
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    metrics = db.query(Metric).filter(
        Metric.type == "performance",
        Metric.recorded_at >= start_date
    ).order_by(Metric.recorded_at).all()
    
    # Format data for charts
    chart_data = [
        {
            "date": metric.recorded_at.isoformat(),
            "value": metric.value,
            "name": metric.name,
            "unit": metric.unit
        }
        for metric in metrics
    ]
    
    return {"data": chart_data}

@router.get("/charts/users")
async def get_users_chart_data(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user metrics for chart visualization.
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    metrics = db.query(Metric).filter(
        Metric.type == "users",
        Metric.recorded_at >= start_date
    ).order_by(Metric.recorded_at).all()
    
    # Format data for charts
    chart_data = [
        {
            "date": metric.recorded_at.isoformat(),
            "value": metric.value,
            "name": metric.name,
            "unit": metric.unit
        }
        for metric in metrics
    ]
    
    return {"data": chart_data}

@router.post("/seed-data")
async def seed_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Seed dashboard with sample metrics data for testing.
    """
    # Check if data already exists
    existing_metrics = db.query(Metric).count()
    if existing_metrics > 0:
        return {"message": "Data already exists", "count": existing_metrics}
    
    # Generate sample metrics
    sample_metrics = []
    base_date = datetime.utcnow() - timedelta(days=30)
    
    for i in range(30):
        current_date = base_date + timedelta(days=i)
        
        # Performance metrics
        sample_metrics.append(Metric(
            name="Response Time",
            type="performance",
            value=random.uniform(50, 200),
            unit="ms",
            description="Average API response time",
            source="api-gateway",
            recorded_at=current_date,
            created_by=current_user.id
        ))
        
        # User metrics
        sample_metrics.append(Metric(
            name="Active Users",
            type="users",
            value=random.randint(100, 500),
            unit="users",
            description="Daily active users",
            source="user-service",
            recorded_at=current_date,
            created_by=current_user.id
        ))
        
        # Revenue metrics
        sample_metrics.append(Metric(
            name="Daily Revenue",
            type="revenue",
            value=random.uniform(1000, 5000),
            unit="€",
            description="Daily revenue",
            source="billing-service",
            recorded_at=current_date,
            created_by=current_user.id
        ))
        
        # System metrics
        sample_metrics.append(Metric(
            name="CPU Usage",
            type="system",
            value=random.uniform(20, 80),
            unit="%",
            description="Average CPU usage",
            source="monitoring",
            recorded_at=current_date,
            created_by=current_user.id
        ))
    
    # Add all metrics to database
    db.add_all(sample_metrics)
    db.commit()
    
    return {"message": "Sample data created successfully", "count": len(sample_metrics)} 