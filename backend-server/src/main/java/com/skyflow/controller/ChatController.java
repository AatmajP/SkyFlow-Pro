package com.skyflow.controller;

import com.skyflow.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    ChatService chatService;

    @GetMapping("/support")
    public Map<String, Object> getSupportData() {
        return chatService.getSupportData();
    }

    @PostMapping("/support")
    public Map<String, String> getChatSupport(@RequestBody Map<String, String> payload) {
        return chatService.processChatQuery(payload.get("query"));
    }
}
