module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4200', // Shell
        'http://localhost:4201', // Dashboard
        'http://localhost:4202', // Utenti
        'http://localhost:4203', // Report
      ],
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'compiled successfully',
      startServerReadyTimeout: 60000,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.6 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}; 