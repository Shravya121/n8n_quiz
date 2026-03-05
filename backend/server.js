app.use(cors({
  origin: function(origin, callback) {
    // Allow all vercel deployments + localhost
    if (!origin || 
        origin.includes('vercel.app') || 
        origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));