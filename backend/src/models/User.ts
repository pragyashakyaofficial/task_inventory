import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'manager';
  restaurantId?: mongoose.Types.ObjectId | null;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incLoginAttempts(): Promise<any>;
  resetLoginAttempts(): any;
  isSuperAdmin(): boolean;
  isManager(): boolean;
  canCreateRestaurant(): boolean;
  canAccessRestaurant(restaurantId: mongoose.Types.ObjectId): boolean;
}

export interface IUserModel extends mongoose.Model<IUser, {}, IUserMethods> {
  findByRestaurant(restaurantId: mongoose.Types.ObjectId): any;
  findSuperAdmins(): any;
}

const userSchema = new mongoose.Schema<IUser, IUserModel, IUserMethods>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email format']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['superadmin', 'manager'],
    required: [true, 'Please specify a role'],
    default: 'manager'
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null,
    index: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ restaurantId: 1, status: 1 });
userSchema.index({ role: 1, status: 1 });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check for account lockout
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil.getTime() < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // Lock for 2 hours
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Role-based helper methods
userSchema.methods.isSuperAdmin = function() {
  return this.role === 'superadmin';
};

userSchema.methods.isManager = function() {
  return this.role === 'manager';
};

userSchema.methods.canCreateRestaurant = function() {
  return this.role === 'superadmin';
};

userSchema.methods.canAccessRestaurant = function(restaurantId: mongoose.Types.ObjectId) {
  if (this.role === 'superadmin') return true;
  return !!(this.restaurantId && this.restaurantId.toString() === restaurantId.toString());
};

// Static method to find users by restaurant
userSchema.statics.findByRestaurant = function(restaurantId: mongoose.Types.ObjectId) {
  return this.find({ restaurantId, status: 'ACTIVE' });
};

// Static method to find superadmins
userSchema.statics.findSuperAdmins = function() {
  return this.find({ role: 'superadmin', status: 'ACTIVE' });
};

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
