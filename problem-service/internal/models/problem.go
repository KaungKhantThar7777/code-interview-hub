package models

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type CustomModel struct {
	ID        uint           `json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`
}

type Problem struct {
	CustomModel
	Title       string         `json:"title" validate:"required,min=3"`
	Difficulty  string         `json:"difficulty" validate:"required,oneof=easy medium hard"`
	Description string         `json:"description" validate:"required,min=10"`
	Examples    datatypes.JSON `json:"examples" gorm:"type:jsonb" validate:"required,min=1,dive"`
	TestCases   datatypes.JSON `json:"testCases" gorm:"type:jsonb" validate:"required,min=1,dive"`
}

type Example struct {
	Input       string `json:"input" validate:"required"`
	Output      string `json:"output" validate:"required"`
	Explanation string `json:"explanation" validate:"required"`
}

type TestCase struct {
	Input    string `json:"input" validate:"required"`
	Output   string `json:"output" validate:"required"`
	IsHidden bool   `json:"isHidden"`
}
