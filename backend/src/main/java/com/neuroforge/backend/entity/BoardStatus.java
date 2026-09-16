package com.neuroforge.backend.entity;

public enum BoardStatus {
	TODO("To Do"),
	IN_PROGRESS("In Progress"),
	IN_REVIEW("In Review"),
	DONE("Done");

	private final String label;

	BoardStatus(String label) {
		this.label = label;
	}

	public String getLabel() {
		return label;
	}
}
