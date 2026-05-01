package com.skyflow.model.dto.response;

import lombok.Data;

@Data
public class FareBreakdownResponse {
    private double baseFare;
    private double taxes;
    private double seatCharge;
    private double surgeCharge;
    private double total;
    private String currency;
    private String seatClass;
    private String seatType;
    private int seatsLeft;
    private boolean surgeActive;
    private String surgeMessage;
}
