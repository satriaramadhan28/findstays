import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  database: process.env.MYSQL_DATABASE || 'findstays',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
});

app.use(cors());
app.use(express.json());

function mapHotel(row) {
  return {
    id: row.id, name: row.name, location: row.location, rating: Number(row.rating),
    reviewsCount: row.reviews_count, pricePerNight: Number(row.price_per_night), imageUrl: row.image_url,
    badge: row.badge, description: row.description,
    amenities: typeof row.amenities === 'string' ? JSON.parse(row.amenities || '[]') : row.amenities || [],
  };
}

function mapBooking(row) {
  return {
    id: row.id, hotelName: row.hotel_name, location: row.location,
    pricePerNight: row.price_per_night ? Number(row.price_per_night) : undefined,
    guestName: row.guest_name, email: row.email, phone: row.phone,
    checkIn: row.check_in, checkOut: row.check_out, paymentMethod: row.payment_method, createdAt: row.created_at,
  };
}

app.get('/api/hotels', async (req, res) => {
  const [rows] = await pool.query('select * from hotels order by created_at desc');
  res.json({ success: true, data: rows.map(mapHotel) });
});

app.get('/api/bookings', async (req, res) => {
  const [rows] = await pool.query('select * from bookings order by created_at desc');
  res.json({ success: true, data: rows.map(mapBooking) });
});

app.post('/api/bookings', async (req, res) => {
  const payload = req.body;

  if (!payload || !payload.hotelName || !payload.guestName || !payload.email) {
    return res.status(400).json({ success: false, message: 'Missing booking fields.' });
  }

  const [result] = await pool.execute(
    `insert into bookings (hotel_name, location, price_per_night, guest_name, email, phone, check_in, check_out, payment_method)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [payload.hotelName, payload.location, payload.pricePerNight || null, payload.guestName, payload.email, payload.phone || null, payload.checkIn, payload.checkOut, payload.paymentMethod || null],
  );
  const [rows] = await pool.query('select * from bookings where id = ?', [result.insertId]);
  return res.status(201).json({ success: true, data: mapBooking(rows[0]) });
});

app.post('/api/hotels', async (req, res) => {
  const hotel = req.body;
  const [result] = await pool.execute(
    `insert into hotels (id, name, location, rating, reviews_count, price_per_night, image_url, badge, description, amenities)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [hotel.id, hotel.name, hotel.location, hotel.rating, hotel.reviewsCount, hotel.pricePerNight || 0, hotel.imageUrl, hotel.badge || null, hotel.description || null, JSON.stringify(hotel.amenities || [])],
  );
  const [rows] = await pool.query('select * from hotels where id = ?', [hotel.id]);
  res.status(201).json({ success: true, data: mapHotel(rows[0]) });
});

app.put('/api/hotels/:id', async (req, res) => {
  const hotel = req.body;
  const [result] = await pool.execute(
    `update hotels set name=?, location=?, rating=?, reviews_count=?, price_per_night=?,
     image_url=?, badge=?, description=?, amenities=? where id=?`,
    [hotel.name, hotel.location, hotel.rating, hotel.reviewsCount, hotel.pricePerNight || 0, hotel.imageUrl, hotel.badge || null, hotel.description || null, JSON.stringify(hotel.amenities || []), req.params.id],
  );
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Hotel not found.' });
  const [rows] = await pool.query('select * from hotels where id = ?', [req.params.id]);
  res.json({ success: true, data: mapHotel(rows[0]) });
});

app.delete('/api/hotels/:id', async (req, res) => {
  const [result] = await pool.execute('delete from hotels where id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Hotel not found.' });
  res.json({ success: true });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ success: false, message: 'Database request failed.' });
});

app.listen(PORT, () => {
  console.log(`FindStays API running on http://localhost:${PORT}`);
});
