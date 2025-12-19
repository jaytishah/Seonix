import Exam from "../models/Exam.model.js";


/**
 * Mark expired exams as inactive in the database
 * This function updates all exams where endDate has passed
 */
export const markExpiredExamsInactive = async () => {
  try {
    const now = new Date();

    const result = await Exam.updateMany(
      {
        endDate: { $lt: now },
        isActive: true,
      },
      {
        $set: { isActive: false },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `✅ Marked ${result.modifiedCount} expired exam(s) as inactive`
      );
    }

    return result;
  } catch (error) {
    console.error("❌ Error marking expired exams as inactive:", error.message);
    return null;
  }
};
