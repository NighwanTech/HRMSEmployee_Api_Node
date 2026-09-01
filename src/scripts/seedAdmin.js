import { connectDB, sequelize } from '../config/db.js';
import { adminLoginService } from '../modules/adminLogin/adminLogin.service.js';

const runSeed = async () => {
  try {
    await connectDB();
    await adminLoginService.seedDefaultAdmin();
    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

runSeed();
