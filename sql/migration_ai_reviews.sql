-- Migration: add AI-review support to an EXISTING portfolio_review database.
-- Run this once via phpMyAdmo/mysql CLI if you already imported the original schema.sql.
-- (Fresh installs can just use the updated sql/schema.sql instead.)

USE portfolio_review;

-- Reviewer is no longer required: AI reviews have no human reviewer_id.
ALTER TABLE reviews
  MODIFY reviewer_id INT NULL;

-- Distinguish who/what produced the review.
ALTER TABLE reviews
  ADD COLUMN author_type ENUM('human','ai') NOT NULL DEFAULT 'human' AFTER reviewer_id;

-- Record which AI model produced the review (NULL for human reviews).
ALTER TABLE reviews
  ADD COLUMN ai_model VARCHAR(100) NULL AFTER author_type;

-- Helpful index for filtering by author type.
CREATE INDEX idx_reviews_author_type ON reviews(author_type);
