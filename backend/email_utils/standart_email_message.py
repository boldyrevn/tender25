from email_utils.mime_multipart_email import MimeMultiPartEmail
from email_utils.smtp_email_sender import SmtpEmailSender

def send_standard_email(recipients:list, sender:str, subject:str, content:str, files:list=None):
    email = MimeMultiPartEmail()
    email.to = recipients
    email.sender = sender
    email.subject = subject
    email.files = files
    email.html_content = content
    sender = SmtpEmailSender()
    sender.send_message(email)