import os
import smtplib

from email_utils.base_email import BaseEmail


class SmtpEmailSender:

    def __init__(self, host: str = '127.0.0.1', port: int = 25, start_tls: bool = False, ssl: bool = False,
                 user: str = None, password: str = None) -> None:
        """
        Initialise connection properties
        :param host: Host of SMTP server (defaults to 127.0.0.1 (localhost) to avoid ipv6)
        :param port: Port of SMTP server
        :param start_tls: Start TLS session
        :param ssl: Use SSL
        :param user: Username for the server
        :param password: Password for the server
        """
        self._host = host
        self._port = port
        self._start_tls = start_tls
        self._ssl = ssl
        self._user = user
        self._password = password

        # ssl вообще правильно, но работает и без него, там короче разница что сразу при ините будет
        # создаваться создаваться защищенное соединение, но задача не в этом, так что просто сделал небезопасно)

    def send_message(self, message: BaseEmail):
        """
        Send a message
        """

        # smtp_connection = smtplib.SMTP_SSL(self._host, self._port) if self._ssl else smtplib.SMTP(self._host,
        #                                                                                           self._port)
        # if self._start_tls:
        #     smtp_connection.starttls()
        #
        # if self._user and self._password:
        #     smtp_connection.login(self._user, self._password)

        sender = 'm2206664@edu.misis.ru'
        password = '23682368asS'

        smtp_connection = smtplib.SMTP('smtp.gmail.com', 587)
        smtp_connection.starttls()
        smtp_connection.login(sender, password)

        smtp_connection.sendmail(sender, message.recipients, message.as_string())
        smtp_connection.quit()
