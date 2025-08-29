-- Add passcode column to trips table
ALTER TABLE trips 
ADD COLUMN passcode VARCHAR(20) NOT NULL DEFAULT '';

-- Update existing trips with a default passcode (you can change these manually)
UPDATE trips 
SET passcode = '1234' 
WHERE passcode = '';
