from linkedin_scraper import Person, actions
from selenium import webdriver

driver = webdriver.Chrome()

email = "your-email@example.com"
password = "yourpassword"

actions.login(driver, email, password)

person = Person("https://www.linkedin.com/in/joey-sham-aa2a50122", driver=driver)
