package com.neuroforge.backend.dto.sprint;

import java.util.List;

import com.neuroforge.backend.entity.BoardStatus;

public record BoardColumn(BoardStatus status, String title, int taskCount, List<BoardCard> cards) {
}
