import { useState } from "react";
import { motion } from "framer-motion";
import { IoPersonCircle, IoSave } from "react-icons/io5";
import { useAuth } from "@hooks/useAuth";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import Input from "@components/common/Input";
import { getInitials } from "@utils/helpers";
import toast from "react-hot-toast";
import authService from "@services/auth.service";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.updateProfile(formData);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white text-3xl font-bold">
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm font-semibold capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
          />

          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  leftIcon={<IoSave />}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
