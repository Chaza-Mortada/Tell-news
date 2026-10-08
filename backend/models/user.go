package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"unique;not null" json:"username"`
	Email     string    `gorm:""uniqueIndex;not null" json:"email"` 
	Password  string    `gorm:"not null" json:"password"`
	Role      string    `gorm:"type:varchar(20);default:user" json:"role"` 
	CreatedAt time.Time `json:"created_at"`
}