package com.skyflow.controller;

import com.skyflow.model.entity.Notification;
import com.skyflow.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    NotificationService notificationService;

    @GetMapping
    public List<Notification> getNotifications(Authentication auth) {
        return notificationService.getNotificationsForUser(auth.getName());
    }
}
