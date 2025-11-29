import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';

// APPOINTMENTS OPERATIONS
export const appointmentService = {
  // Create new appointment
  create: async (appointmentData) => {
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...appointmentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'scheduled'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Get appointments for a specific user
  getByUser: async (userId, userType) => {
    try {
      const field = userType === 'doctor' ? 'doctorId' : 'patientId';
      const q = query(
        collection(db, 'appointments'),
        where(field, '==', userId),
        orderBy('appointmentDate', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw error;
    }
  },

  // Update appointment
  update: async (appointmentId, updateData) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  // Delete appointment
  delete: async (appointmentId) => {
    try {
      await deleteDoc(doc(db, 'appointments', appointmentId));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },

  // Real-time listener for appointments
  listen: (userId, userType, callback) => {
    const field = userType === 'doctor' ? 'doctorId' : 'patientId';
    const q = query(
      collection(db, 'appointments'),
      where(field, '==', userId),
      orderBy('appointmentDate', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      callback(appointments);
    });
  }
};

// CONSULTATIONS OPERATIONS
export const consultationService = {
  // Create new consultation
  create: async (consultationData) => {
    try {
      const docRef = await addDoc(collection(db, 'consultations'), {
        ...consultationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }
  },

  // Get consultations for a user
  getByUser: async (userId, userType) => {
    try {
      const field = userType === 'doctor' ? 'doctorId' : 'patientId';
      const q = query(
        collection(db, 'consultations'),
        where(field, '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting consultations:', error);
      throw error;
    }
  },

  // Update consultation
  update: async (consultationId, updateData) => {
    try {
      await updateDoc(doc(db, 'consultations', consultationId), {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating consultation:', error);
      throw error;
    }
  },

  // Add note to consultation
  addNote: async (consultationId, note) => {
    try {
      await updateDoc(doc(db, 'consultations', consultationId), {
        notes: arrayUnion({
          id: Date.now().toString(),
          content: note,
          timestamp: new Date().toISOString()
        }),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }
};

// CHAT/MESSAGES OPERATIONS
export const chatService = {
  // Create or get chat room
  createOrGetRoom: async (participants) => {
    try {
      // Sort participants to ensure consistent room ID
      const sortedParticipants = participants.sort();
      const roomId = sortedParticipants.join('_');
      
      const roomRef = doc(db, 'chatRooms', roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        await setDoc(roomRef, {
          participants: sortedParticipants,
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastActivity: serverTimestamp()
        });
      }
      
      return roomId;
    } catch (error) {
      console.error('Error creating/getting chat room:', error);
      throw error;
    }
  },

  // Send message
  sendMessage: async (roomId, message) => {
    try {
      await addDoc(collection(db, 'chatRooms', roomId, 'messages'), {
        ...message,
        timestamp: serverTimestamp()
      });
      
      // Update room's last message
      await updateDoc(doc(db, 'chatRooms', roomId), {
        lastMessage: message.content,
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get user's chat rooms
  getUserRooms: async (userId) => {
    try {
      const q = query(
        collection(db, 'chatRooms'),
        where('participants', 'array-contains', userId),
        orderBy('lastActivity', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting chat rooms:', error);
      throw error;
    }
  },

  // Listen to messages in a room
  listenToMessages: (roomId, callback) => {
    const q = query(
      collection(db, 'chatRooms', roomId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      callback(messages);
    });
  }
};

// USERS OPERATIONS
export const userService = {
  // Get all doctors
  getDoctors: async () => {
    try {
      const q = query(
        collection(db, 'users'),
        where('userType', '==', 'doctor'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting doctors:', error);
      throw error;
    }
  },

  // Get user by ID
  getById: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Search users
  search: async (searchTerm, userType = null) => {
    try {
      let q = collection(db, 'users');
      
      if (userType) {
        q = query(q, where('userType', '==', userType));
      }
      
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter by search term (client-side filtering for simplicity)
      return users.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
};

// ANALYTICS AND STATS
export const analyticsService = {
  // Get dashboard stats for a user
  getDashboardStats: async (userId, userType) => {
    try {
      const stats = {};
      
      if (userType === 'doctor') {
        // Total appointments
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('doctorId', '==', userId)
        );
        const appointmentsSnap = await getDocs(appointmentsQuery);
        stats.totalAppointments = appointmentsSnap.size;
        
        // Completed consultations
        const consultationsQuery = query(
          collection(db, 'consultations'),
          where('doctorId', '==', userId),
          where('status', '==', 'completed')
        );
        const consultationsSnap = await getDocs(consultationsQuery);
        stats.completedConsultations = consultationsSnap.size;
        
        // Pending appointments
        const pendingQuery = query(
          collection(db, 'appointments'),
          where('doctorId', '==', userId),
          where('status', '==', 'scheduled')
        );
        const pendingSnap = await getDocs(pendingQuery);
        stats.pendingAppointments = pendingSnap.size;
        
      } else {
        // Patient stats
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('patientId', '==', userId)
        );
        const appointmentsSnap = await getDocs(appointmentsQuery);
        stats.totalAppointments = appointmentsSnap.size;
        
        const consultationsQuery = query(
          collection(db, 'consultations'),
          where('patientId', '==', userId)
        );
        const consultationsSnap = await getDocs(consultationsQuery);
        stats.totalConsultations = consultationsSnap.size;
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }
};