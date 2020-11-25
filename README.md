![enter image description here](https://img.shields.io/badge/Author-Nestorbd-yellow)

# Full Stack Proyect

This project will be developed for the company Tandem Enterprise.
The project proposed by the company is to implement a trading idea
oriented to Canary products. In the application you can view, create, update
and eliminate products from the Canary Islands.
There will also be users who will have to register to be able to place an order.
If a user has not registered or is not logged in, they will only be able to view the products
available, but you will not be able to place any order.

## 🚩 Table of Contents

* [Data model](#Data-Model)
* [User Requirements](#User-Requirements)
* [Use Case](#Use-Case)
* [Interfaces](#Interfaces)
* [Tools](#-Tools)
* [Spanish Documentation](#-Spanish-Documentation)
* [Acknowledgments](#-Acknowledgments)

## Data Model
Here will be shown how the project database is organized.

### E/R Diagram
![E/R Diagram](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/E_R_Diagram.png)

### Relational Model
![Relational Model](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/RelationalModel.png)

[SQL](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/DB_e_comerce.sql)

## User Requirements

* The unregistered user will only be able to view the products.
* The cart can only be accessed if the user is registered.
* To make a purchase you need the shipping address.
* The user can update their data in the profile.
* The user can register or log in if he has a google account.

## Use Case
![Use Case](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/UseCase.png)
## Interfaces

### Mockup

![Main Screen](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/mockup/Inicio.png)
*Figure 1: Main Screen*

This is the main screen, in each of the screens will be present the
navigation bar with the company logo and tabs, the login tab
it will only be visible only if the user is not registered, if the user is registered
other tabs that will be seen later will be enabled. The eyelash of product te
take to this same page and the magnifying glass icon you can search for a product.
The footer will also be shown, where the company logo and the
contact.
On this main screen you will see all the available products with your name,
price and description. If you click on one of the products this will take you to the screen of that product.

![Log In / Register user](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/mockup/Login.png)
*Figure 2: Log In / Register user*

On this screen the user can log in or register.
To log in you will be asked for username and password or instead have
an account with google.
To register you will only ask for username, email, password and accept
the company Terms, data missing from the user table will be requested from the
time to make the purchase or the user can fill them in their profile as we will see later.

![failed to log in / register user](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/mockup/Fail_login.png)
*Figure 3: failed to log in / register user*

If the user makes any mistake, he will be notified with these notices and until no
fix them you will not be able to log in or register.

![main screen with registered user](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/mockup/Inicio_loged.png)
*Figure 4: main screen with registered user*

When the user logs in it will return to this main screen, but now 
instead of a login tab we will find the cart and the profile of the user.

![Product Display](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/mockup/product_view.png)
*Figure 5: Product Display*

When the user wants to see a product it will redirect him to such a screen, in
where you can see several images of the product, you will have a broader description
on the Home screen and you can add this product to the shopping cart.

![shopping cart screen](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/mockup/cart.png)
*Figure 6: shopping cart screen*

This is the cart screen, where the user can see the products he has
added to your basket. The user can choose the quantity he wants of each product or
if you want to remove it from the basket, you can also see the total price of the purchase and a
once you know what you want to buy you can give the corresponding button with this
action (this action will not be implemented in this project for now upon request
company).

![user profile screen*](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/mockup/Profile.png)
*Figure 7: user profile screen*

This screen is where the user will be able to see their data and if they want to modify something
it will give the edit rofile button.

![display for adding or modifying user data](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/mockup/Update.png)
*Figure 8: display for adding or modifying user data*

When the user wants to change or add data to his profile will be redirected to this
page, where you can fill in all the data related to the user.

![failure to add or modify user data](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/mockup/Fail_update.png)
*Figure 9: failure to add or modify user data*

If the user does not fill in these fields correctly, they will be warned that
they are correct so that you can correct them.


* [Prototype](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/FullStack_Prototype)

### Usability

Here we will see the basic usability features that the project has
for now, jandonos in the mockup and the prototype:

* Easy to learn and intuitive

These two points are complementary, the Website is intuitive since the
structure and operation are very similar to those used in others
websites dedicated to commerce such as amazon and ebay.

* Error prediction
As seen in figure 3 or figure 9, the user is noticed if some
data from those you have entered is erroneous.

* Elegant in its design
As seen in the mockup and the prototype will use a basic color palette
(yellow, white, blue, black) based on the Canary Flag as it was used
to sell Canarian products.

## 🔧 Tools

* [LaTex](https://es.overleaf.com) -- To do the documentation
* [Justinmind](https://www.justinmind.com) -- To make the mockup and prototype
* [Node.js](https://nodejs.org/es/) -- For [backend](https://github.com/Nestorbd/Full-Stack-Proyect/tree/master/E-commerce/backend)
* [Ionic-Angular](https://ionicframework.com/docs/angular/your-first-app) -- For [frontend](https://github.com/Nestorbd/Full-Stack-Proyect/tree/master/E-commerce/frontend/e-commerce)
* [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) -- For database

## 📜 Spanish Documentation

* [.tex](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/Full_Stack_Proyect.tex)
* [.pdf](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/Full_Stack_Proyect.pdf)

## 🤝 Acknowledgments

* [Meganitrospeed](https://github.com/Meganitrospeed)
* [Sergio Peñate](https://github.com/SergioPA11)
