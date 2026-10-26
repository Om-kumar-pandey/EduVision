package com.aicte.complaints;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class ComplaintMonitoringApplication {
    public static void main(String[] args) {
        SpringApplication.run(ComplaintMonitoringApplication.class, args);
    }
}
