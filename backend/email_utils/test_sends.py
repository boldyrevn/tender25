from email_utils.standart_email_message import send_standard_email
import pandas as pd
def main():

    # Создаем тестовые данные
    data = {
        'Column1': [1, 2, 3],
        'Column2': ['A', 'B', 'C'],
        'Column3': [4.5, 5.5, 6.5],
        'Column4': [True, False, True]
    }

    # Создаем DataFrame
    df = pd.DataFrame(data)

    sender = 'm2206664@edu.misis.ru'
    subject = 'Тестовая отправка нескольким людям'
    html_content = 'Привет! Проверим подятянулся ли русский язык<br>'
    html_content += f"<h3>Работоспособность конструктора и проверка шрифтов<br>"
    html_content += 'Таблица с какими-то рандомными данными<br>'
    html_content += " "
    html_content += df.to_html(index=False, justify="left").replace("\n", "")
    recipients = [sender, 'bulatove106@gmail.com']
    send_standard_email(recipients=recipients, sender=sender, subject=subject, content=html_content)


if __name__ == "__main__":
    main()