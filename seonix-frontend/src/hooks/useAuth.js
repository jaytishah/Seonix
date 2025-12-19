import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getCurrentUser, logout } from '@store/slices/authSlice';
import authService from '@services/auth.service';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated and fetch user data
    if (!user && authService.isAuthenticated()) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isStudent,
    isTeacher,
    isAdmin,
    logout: handleLogout,
  };
};
