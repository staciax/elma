-- Revises: V0
-- Creation Date: 2024-08-25T05:22:22.960Z UTC
-- Reason: init

-- TODO: Add indexes
-- TODO: Add CHECK constraints

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NULL,
    last_name VARCHAR(255) NULL,
    hashed_password VARCHAR(60) NOT NULL,
    role ENUM('SUPERUSER', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (id),
    UNIQUE INDEX users_email_key(email),
    INDEX idx_users_email(email)
);

-- TODO: publishers name is unique right?
CREATE TABLE IF NOT EXISTS publishers (
    id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,

    PRIMARY KEY (id)
);

-- TODO: categories name is unique right?
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,

    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS authors (
    id VARCHAR(36) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,

    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    isbn VARCHAR(13) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    published_date DATETIME(3) NOT NULL,
    publisher_id VARCHAR(36) NULL,
    category_id VARCHAR(36) NULL,

    -- INDEX idx_products_title(title),
    PRIMARY KEY (id),
    FOREIGN KEY (publisher_id) REFERENCES publishers(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE
); 

CREATE TABLE IF NOT EXISTS product_images (
    product_id VARCHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    
    PRIMARY KEY (product_id, filename),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS product_authors (
    product_id VARCHAR(36) NOT NULL,
    author_id VARCHAR(36) NOT NULL,

    PRIMARY KEY (product_id, author_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS shopping_carts (
    product_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,

    PRIMARY KEY (product_id, user_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
);