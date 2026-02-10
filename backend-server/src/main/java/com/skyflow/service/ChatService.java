package com.skyflow.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    public Map<String, Object> getSupportData() {
        Map<String, Object> data = new HashMap<>();

        List<Map<String, String>> faqs = new ArrayList<>();
        faqs.add(createFaq("How do I search for flights?", "Enter your cities and dates in the search bar above."));
        faqs.add(createFaq("What is Patro Airlines?",
                "Our flagship carrier with premium service and free seat selection."));
        faqs.add(createFaq("Can I cancel my booking?", "Yes, visit your profile to manage and cancel bookings."));

        data.put("faqs", faqs);
        data.put("supportEmail", "support@skyflow.com");
        data.put("supportPhone", "+1-800-SKY-FLOW");
        data.put("chatHours", "24/7 (AI-assisted)");

        return data;
    }

    public Map<String, String> processChatQuery(String query) {
        Map<String, String> response = new HashMap<>();

        if (query == null) {
            response.put("fact", "I can help with bookings, cancellations, and airline policies.");
            return response;
        }

        if (query.toLowerCase().contains("refund") || query.toLowerCase().contains("cancel")) {
            response.put("fact",
                    "Patro Airlines offers 100% refund for flexible tickets. Standard airlines offer 24h cancellation.");
        } else if (query.toLowerCase().contains("baggage")) {
            response.put("fact", "Economy class: 23kg check-in. Business: 2x 32kg.");
        } else {
            response.put("fact", "I can help with bookings, cancellations, and airline policies.");
        }
        return response;
    }

    private Map<String, String> createFaq(String q, String a) {
        Map<String, String> faq = new HashMap<>();
        faq.put("question", q);
        faq.put("answer", a);
        return faq;
    }
}
