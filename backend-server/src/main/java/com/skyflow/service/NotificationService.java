package com.skyflow.service;

import com.skyflow.model.entity.Notification;
import com.skyflow.model.entity.User;
import com.skyflow.repository.NotificationRepository;
import com.skyflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Notification> getNotificationsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public void createNotification(User user, String message, Long bookingId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setBookingId(bookingId);
        notificationRepository.save(notification);
    }
}
