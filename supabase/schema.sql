create database if not exists findstays;
use findstays;

create table if not exists hotels (
  id varchar(100) primary key,
  name varchar(255) not null,
  location varchar(255) not null,
  rating decimal(2, 1) not null default 0,
  reviews_count int not null default 0,
  price_per_night decimal(10, 2) not null default 0,
  image_url text not null,
  badge varchar(100),
  description text,
  amenities json not null,
  created_at timestamp not null default current_timestamp
);

create table if not exists bookings (
  id bigint primary key auto_increment,
  hotel_name varchar(255) not null,
  location varchar(255) not null,
  price_per_night decimal(10, 2),
  guest_name varchar(255) not null,
  email varchar(255) not null,
  phone varchar(50),
  check_in varchar(50) not null,
  check_out varchar(50) not null,
  payment_method varchar(100),
  created_at timestamp not null default current_timestamp
);

