import TimeSlot from '../models/timeSlotModel.js';

// Get time slots for a doctor
export const getTimeSlotsByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Verify the requesting doctor is accessing their own time slots
    // This check should ideally be in middleware for reusability, but keeping here for direct move
    
    if (req.user._id.toString() !== doctorId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own time slots'
      });
    }

    const timeSlots = await TimeSlot.find({ doctorId })
      .sort({ day: 1, startTime: 1 });

    // Group time slots by day
    const groupedSlots = timeSlots.reduce((acc, slot) => {
      if (!acc[slot.day]) {
        acc[slot.day] = [];
      }
      acc[slot.day].push(slot);
      return acc;
    }, {});

    res.json({
      success: true,
      timeSlots: groupedSlots
    });
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time slots',
      error: error.message
    });
  }
};

// Add new time slots
export const addTimeSlots = async (req, res) => {
  try {
    const { doctorId, slots } = req.body;

    // Verify the requesting doctor is adding their own time slots
    if (req.user._id.toString() !== doctorId) {
      return res.status(403).json({
        success: false,
        message: 'You can only add time slots for yourself'
      });
    }

    const newSlots = await TimeSlot.create(
      slots.map(slot => ({
        doctorId,
        ...slot
      }))
    );

    res.status(201).json({
      success: true,
      message: 'Time slots added successfully',
      timeSlots: newSlots
    });
  } catch (error) {
    console.error('Error adding time slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add time slots',
      error: error.message
    });
  }
};

// Delete a time slot
export const deleteTimeSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await TimeSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }

    // Verify the requesting doctor owns this time slot
    if (slot.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own time slots'
      });
    }

    await TimeSlot.findByIdAndDelete(slotId);

    res.json({
      success: true,
      message: 'Time slot deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete time slot',
      error: error.message
    });
  }
};

// Delete all time slots for a day
export const bulkDeleteTimeSlots = async (req, res) => {
  try {
    const { doctorId, day } = req.body;

    // Verify the requesting doctor is deleting their own time slots
    if (req.user._id.toString() !== doctorId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own time slots'
      });
    }

    await TimeSlot.deleteMany({ doctorId, day });

    res.json({
      success: true,
      message: `All time slots for ${day} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting time slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete time slots',
      error: error.message
    });
  }
};
