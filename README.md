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
* [Installation manual](#Installation-manual)
* [Comparison of technologies](#Comparison-of-technologies)
* [Planning](#Planing)
* [Tools](#-Tools)
* [Spanish Documentation](#-Spanish-Documentation)
* [Acknowledgments](#-Acknowledgments)

## Data Model
Here will be shown how the project database is organized.

### Overview
Here will be shown how the project database is organized.

* **Entities**

    In the database you will need to have the following fields:

    - Users, who will have a key, a name, surname, email, username, password and you will also have to know if you are an administrator or not.

    - Address of the user, the address of each user will be stored, and if you will have, a key, the street, number, postal code, town, province and country.

     - Orders, a key, date and status will be stored.

    - Products, it will store a key, a name, the description on,price, tax percentage, category, know if it is available and an image of the product.
    
    
* **Relatioships**

  - A user can only have one address and one address belongs to one user.

  - A user can place multiple orders, but an order belongs only to a user.

  - An order can have several products, and a product can be onseveral orders.


### E/R Diagram
![E/R Diagram](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/E_R_Diagram.png)

### Step from E/R to relational model
Bold words are primary keys and those with an asterisk are foreign keys.

* PRODUCTS (**id**, name, description, price,tax rate, image, category, availability).

* ORDER_PRODUCT (**id_product***,**id_order***,timestamp).

  - id_product is PRODUCTS foreign key.
  - id_order is ORDERS foreign key.

* ORDERS (**id**, date, status, timestamp, id_user*).

  - id_user is USERS foreign key.

* USERS (**id**, name, last_name, userName, email, password, isAdmin, timestamp, id_address*).

   - id_address is ADDRESS foreign key.

* ADDRESS (**id**, street, number, zip_code, location, province, country).

### Relational Model
![Relational Model](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/RelationalModel.png)

[SQL](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/DB_e_comerce.sql)

## User Requirements

* Plataform.

    - Web application.
    - Responsive, it can be seen on any device that has internet and a browser.
  
* It will only reach the purchase screen for now.

* The unregistered user will only be able to view the products.

    - If the unregistered user tries to do an action that requires registration, you will be taken to the screen where you can log in or register.  
    - For registration you will only ask for name, email and password, these last two they will have to be confirmed to avoid confuciations.  
    - If the user does not complete a field correctly, they will be notified. 
  
  
* To make a purchase you need the shipping address.

    - If the user tries to make a purchase without having a shipping address he will ask.
    - Also, if you have a shipping address, you must confirm that the user he wants to use that address for the purchase.
  
  
* The user can update their data in the profile.

    - You can update any data, but in the case of email and password if you want to change them you will have to confirm them as it is done in the registry.
  
  
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

Here we will see the basic usability features that the project has:

* Easy to learn and intuitive

These two points are complementary, the Website is intuitive since the structure and operation are very similar to those used in others
websites dedicated to commerce such as amazon and ebay.

![home](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/usability/home.png)
*Principal view*

* Error prediction

As seen in the following images, the user is noticed if any data
of those you have entered is erroneous or some error has occurred.

![Fail sign in](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/usability/errors.png)
*Fail to Sign in 1*
![Fail sign in](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/usability/errorWindow.png)
*Fail to Sign in 2*

* Elegant in its design

As seen in the mockup and the prototype will use a basic color palette
(yellow, white, blue, black) based on the Canary Flag as it was used
to sell Canarian products.

* Usable

    * The user is able to initiate actions and control them, such as start and close session.
    * The user can change the colors of the application, from light to dark, according to your taste.
    
    ![Dark mode](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/usability/darkTheme.png)
    *Dark mode*
    
    * The user can interact with the application and access all the content that is allowed, depending on the type of user you are.
    * If the user makes some error when inserting data as per example in the registry, you will be notified as it is done in the following image.
    
    ![Forms error](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/usability/FormsErrors.png)
    *validated form 1*
      ![Forms error 2](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/usability/noData.png)
    *validated form 2*
    
* User familiarity

The app can be accessed from any device.

* Minimal surprise

The user will know at all times what he is doing, so he will not take no surprise.

* Security

The user password is stored in the database encrypted with bcrypt and the base64-encoded token.

 ![Security](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/Doncumentation/Documentos/img/usability/Segurity.png)
    *Encryption and coding*
    
## Installation manual

To be able to use the application first we need to have the applications installed
[Git](https://git-scm.com/downloads) and [node.JS](https://nodejs.org/es/download/).
After having installed these two applications we have to access a terminal
as the cmd in the folder in which you want to install the application and write the
following command:

```
git clone https://github.com/Nestorbd/Full−Stack−Proyect
cd E−commerce/backend
npm install

```

At the end of this we will have the application server installed.
If you want the application to have some basic data you will need to install some program
like the MySQL Workbench or phpMyAdmin to be able to read the [SQL](https://github.com/Nestorbd/Full-Stack-Proyect/blob/master/E-commerce/DB_e_comerce.sql).
You also have to create a file .env on the backend with the following data:

```
JWT SECRET=V3RY#1MP0RT@NT$3CR3T#
MYSQL DATABASE=db e commerce
MYSQL USER=root
MYSQLPASSWORD=root
MYSQLROOTPASSWORD=root
DB HOST=l o c a l h o s t
NODE ENV=development

```

To install the client we have to go back to the E-commerce root directory and do what
following:

```
cd E−commerce/frontend/e−commerce
npm install

```

And the client would be installed, now to start the application first we have
that boot the server and then the client, below I explain how it is done.
First you have to go back to the E-commerce root directory and do the following:

```
cd E−commerce/backend
node server.js

```

Now we open another console in the root directory and do this:

```
cd E−commerce/frontend/e−commerce
ionic serve

```
And that's it, we already have our application installed and working.

## Comparison of technologies

### IONIC

It is a framework that is becoming very popular lately. It is a tool
that programmers can use totally free, to develop
apps based on HTML5, CSS and JavaScript. It is built with Sass and optimized
for AngularJS. Adem as, is free and open source.

* Advantage
    
    * AngularJS
    
    Works perfectly with AngularJS. Giving rise to a
    robust architecture for app development. You can create mobile apps
    rich and robust, to hang in your favorite app store.
    
    * It's easy to understand
    
    You will not have to complicate your life too much using
    the framework is quite simple to understand. Is to develop a
    code once and reuse it as many times as you want.
    
    * Neat
    
    It is modern and designed to work with the most current, with
    a clean and neat design. The components are attractive, the typography,
    etc.
    
    * Create, build, test and compile
    
    You can create, build, and compile
    apps on any platform, all with a single command. That's why
    consider a powerful CLI.
    
    * Works fast
    
   If you despair with little, you will like Ionic. It's done
    to be quick.
    
    * Ionic Creator
    
    One of the advantages of this framwork, is one of its tools,
    Ionic Creator. Basically it allows to create the Interfaces without having
    to stick the code to machete. You can create the graphic part easily without touching
    the code for nothing.
    
* Disadvantage

    * It's a hybrid language, it's never going to work as fast as an app native.
    * It doesn't have all the features that a native app can have.
    * It is not recommended for very large projects.
    * Some components may need to be programmed specifically for iOS.
    
    
    | Comparative | Hybrid applications | Native apps | Web applications |
| --- | --- | --- | --- |
| Learning curve | Simple to learn, and only one curve for all developments | More complicated, and requires learning for each platform separately | Save hardware and software costs |
| Export to different platforms | Very simple, it is developed once and exported to all | Requires development for each programming language | Easy to use |
| Development cost | Lower cost, requiring only one development and being this simpler | Higher cost, you have to develop more times and in more complex languages | They facilitate collaborative and remote work |
| Ease of finding developers | Very simple, and a single person can export to multiple platforms | Somewhat less simple, and normally requires one person for each platform | Scalable and fast update |
| Performance | Very good, except maybe for very demanding applications, games, 3D | Optimum | They cause fewer errors and problems |
| Access to device features | Very spacious, although not complete | Full | Data is more secure | 
| Visual appearance and user experience | Very good, simulating behaviors with HTML5 and CSS3, although it may not be optimal | May be optimal |

## Plannig

You can see my [planning](https://github.com/Nestorbd/Full-Stack-Proyect/projects/1) that I have done in the github repository itself

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

* [Tiburcio Cruz](https://github.com/tcrurav)
* [Sergio Peñate](https://github.com/SergioPA11)
* [Eliel Bruna](https://github.com/elbrus19)
* [Oswaldo J. Pérez Luis](https://github.com/LilGalois) -- Thanks for teaching me LaTeX 
* [Meganitrospeed](https://github.com/Meganitrospeed)
