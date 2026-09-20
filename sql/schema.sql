-- Portfolio Review Platform - MySQL Schema
-- Import this via phpMyAdmin (XAMPP) or: mysql -u root -p < schema.sql

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('submitter','reviewer','admin') DEFAULT 'submitter',
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE portfolios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  link VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT NULL,
  status ENUM('pending','reviewed','archived') DEFAULT 'pending',
  version INT DEFAULT 1,
  avg_creativity DECIMAL(4,2) DEFAULT NULL,
  avg_technical DECIMAL(4,2) DEFAULT NULL,
  avg_presentation DECIMAL(4,2) DEFAULT NULL,
  avg_overall DECIMAL(4,2) DEFAULT NULL,
  review_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE portfolio_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  portfolio_id INT NOT NULL,
  tag VARCHAR(50) NOT NULL,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  portfolio_id INT NOT NULL,
  reviewer_id INT NULL,
  author_type ENUM('human','ai') NOT NULL DEFAULT 'human',
  ai_model VARCHAR(100) NULL,
  score_creativity TINYINT NOT NULL,
  score_technical TINYINT NOT NULL,
  score_presentation TINYINT NOT NULL,
  score_overall TINYINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_review_per_user (portfolio_id, reviewer_id)
) ENGINE=InnoDB;

-- Helpful indexes
CREATE INDEX idx_portfolios_user ON portfolios(user_id);
CREATE INDEX idx_portfolios_status ON portfolios(status);
CREATE INDEX idx_reviews_portfolio ON reviews(portfolio_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);

-- Optional: seed an admin user (password = "Admin123!" hashed with PHP password_hash/BCRYPT)
-- Generate your own hash via: php -r "echo password_hash('Admin123!', PASSWORD_BCRYPT);"
-- INSERT INTO users (name, email, password_hash, role) VALUES
-- ('Admin', 'admin@example.com', '$2y$10$REPLACE_WITH_REAL_HASH', 'admin');
