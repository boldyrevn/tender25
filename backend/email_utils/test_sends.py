from email_utils.standart_email_message import send_standard_email
import pandas as pd
import os
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

    report_4email = f'metric_report.xlsx' # Название файла, c ФОРМАТОМ ФАЙЛА!!!
    #df.to_csv(report_4email, index=False)
    #df.to_csv(report_4email, index=False)

    date = '02.03.2025'

    sender = 'm2206664@edu.misis.ru'
    subject = f'Регулярный отчет по метрике: "Оборот за период" от {date}'
    html_content = 'Добрый день! Отчет по метрике "Оборот за период" выгружен<br>'
    html_content += f"Файл с отчетностью по метрике в виде таблицы приложен в теле письма<br>"
    html_content += 'Краткий срез представлен в таблице ниже:<br>'
    html_content += " "
    html_content += df.to_html(index=False, justify="left").replace("\n", "")
    recipients = [sender, 'bulatove106@gmail.com', 'm2110542@edu.misis.ru']
    files = [report_4email]
    send_standard_email(recipients=recipients, sender=sender, subject=subject, content=html_content, files=files)

    os.remove(report_4email)


if __name__ == "__main__":
    main()