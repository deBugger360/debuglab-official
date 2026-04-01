<?php
header('Content-Type: application/json');

// Ensure request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit;
}

// Extract inputs
$name = isset($_POST['contactName']) ? trim($_POST['contactName']) : '';
$email = isset($_POST['contactEmail']) ? trim($_POST['contactEmail']) : '';
$projectDetails = isset($_POST['contactDetails']) ? trim($_POST['contactDetails']) : '';

// Strict Validation
$errors = [];

if (empty($name) || strlen($name) < 2) {
    $errors[] = "Name must be at least 2 characters long.";
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "A valid email address is required.";
}

if (empty($projectDetails) || strlen($projectDetails) < 10) {
    $errors[] = "Project details must be at least 10 characters to ensure we understand your needs.";
}

// Return errors if any
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => implode(' ', $errors)]);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php'; // Included in case you activate SMTP later

// Live Production PHPMailer Configuration
$mail = new PHPMailer(true);

try {
    // By default, removing isSMTP() forces PHPMailer to securely utilize the server's native 
    // sendmail/MTA which often works immediately on active deployments without passwords.
    // If you need explicit SMTP auth later, uncomment the block below:
    
    /* 
    $mail->isSMTP();
    $mail->Host       = 'mail.debuglabdigital.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'hello@debuglabdigital.com'; 
    $mail->Password   = 'YOUR_PASSWORD_HERE';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;
    */

    // Bypassing DMARC drops by authenticating the 'From' sender on your own domain
    $mail->setFrom('server@debuglabdigital.com', 'Debug Lab Forms');
    
    // The operational live email address receiving the lead
    $mail->addAddress('hello@debuglabdigital.com');  
    
    // Capturing the lead's actual email for the dynamic "Reply" button inside your inbox
    $mail->addReplyTo($email, $name);

    $mail->isHTML(false);
    $mail->Subject = "New Project Lead: " . $name;
    
    $message = "You have received a new contact lead via the Debug Lab Digital framework.\n\n";
    $message .= "Name: " . $name . "\n";
    $message .= "Email: " . $email . "\n\n";
    $message .= "Project Details:\n" . $projectDetails . "\n";
    
    $mail->Body = $message;

    // Execute secure deployment
    $mail->send();
    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'Lead securely captured for operational follow-up by the Debug Lab team.']);

} catch (Exception $e) {
    // Specific error dumping helps verify transport faults during testing
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => "System communication error prevented relay: {$mail->ErrorInfo}"]);
}
?>
