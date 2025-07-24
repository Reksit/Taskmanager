package com.example.manager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    public void sendVerificationEmail(String toEmail, String verificationCode, String username) {
        // Check if email is configured
        if (fromEmail == null || fromEmail.isEmpty() || "taskmanagerai@gmail.com".equals(fromEmail)) {
            System.out.println("=== EMAIL NOT CONFIGURED - USING CONSOLE ===");
            System.out.println("To: " + toEmail);
            System.out.println("Username: " + username);
            System.out.println("Verification Code: " + verificationCode);
            System.out.println("Please configure your Gmail App Password in application.properties");
            System.out.println("==========================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("TaskManager Pro - Verify Your Email");
            message.setText(buildVerificationEmailBody(username, verificationCode));
            
            mailSender.send(message);
            System.out.println("Verification email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception, allow registration to continue
        }
    }

    private String buildVerificationEmailBody(String username, String verificationCode) {
        return String.format(
            "🎉 Welcome to TaskManager Pro, %s!\n\n" +
            "Thank you for joining TaskManager Pro - your ultimate task management solution!\n\n" +
            "📧 EMAIL VERIFICATION REQUIRED\n" +
            "To complete your registration, please use this verification code:\n\n" +
            "🔐 VERIFICATION CODE: %s\n\n" +
            "⏰ This code will expire in 10 minutes for security purposes.\n\n" +
            "Once verified, you'll be able to:\n" +
            "✅ Create and manage your tasks\n" +
            "✅ Set priorities and due dates\n" +
            "✅ Track your productivity\n\n" +
            "If you didn't create this account, please ignore this email.\n\n" +
            "Happy task managing! 🚀\n\n" +
            "Best regards,\n" +
            "The TaskManager Pro Team\n" +
            "taskmanagerai@gmail.com",
            username, verificationCode
        );
    }
}