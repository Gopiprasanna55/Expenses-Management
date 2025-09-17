import express from 'express';
import { authProvider } from './authProvider';
import { storage } from './storage';
import { insertUserSchema, updateUserSchema } from '@shared/schema';

const router = express.Router();

// Get all users (admin only)
router.get('/', authProvider.requireAdmin(), async (req, res) => {
  try {
    const users = await storage.getUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID (admin only)
router.get('/:id', authProvider.requireAdmin(), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await storage.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user role or status (admin only)
router.put('/:id', authProvider.requireAdmin(), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from demoting themselves
    if (id === req.session.user?.id && req.body.role === 'user') {
      return res.status(400).json({ error: 'Cannot demote yourself from admin role' });
    }
    
    const userData = updateUserSchema.partial().parse(req.body);
    const user = await storage.updateUser(id, userData);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authProvider.requireAdmin(), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === req.session.user?.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const success = await storage.deleteUser(id);
    
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;