package com.neuroforge.backend.exception;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.persistence.EntityNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private ResponseEntity<Map<String, Object>> body(HttpStatus status, String message) {
		Map<String, Object> response = new LinkedHashMap<>();
		response.put("timestamp", Instant.now().toString());
		response.put("status", status.value());
		response.put("error", status.getReasonPhrase());
		response.put("message", message);
		return ResponseEntity.status(status).body(response);
	}

	@ExceptionHandler(EntityNotFoundException.class)
	public ResponseEntity<Map<String, Object>> notFound(EntityNotFoundException exception) {
		return body(HttpStatus.NOT_FOUND, exception.getMessage());
	}

	@ExceptionHandler(BusinessRuleException.class)
	public ResponseEntity<Map<String, Object>> conflict(BusinessRuleException exception) {
		return body(HttpStatus.CONFLICT, exception.getMessage());
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> badRequest(IllegalArgumentException exception) {
		return body(HttpStatus.BAD_REQUEST, exception.getMessage());
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException exception) {
		String message = exception.getBindingResult().getFieldErrors().stream()
				.map(error -> error.getField() + " " + error.getDefaultMessage())
				.reduce((first, second) -> first + "; " + second)
				.orElse("Invalid request");
		return body(HttpStatus.BAD_REQUEST, message);
	}

	/** Malformed JSON, or an invalid enum value such as an unknown skill / role. */
	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<Map<String, Object>> unreadable(HttpMessageNotReadableException exception) {
		Throwable cause = exception.getMostSpecificCause();
		String message = cause != null && cause.getMessage() != null && cause instanceof IllegalArgumentException
				? cause.getMessage()
				: "Malformed request body or invalid value";
		return body(HttpStatus.BAD_REQUEST, message);
	}

	@ExceptionHandler(MissingServletRequestParameterException.class)
	public ResponseEntity<Map<String, Object>> missingParam(MissingServletRequestParameterException exception) {
		return body(HttpStatus.BAD_REQUEST, "Required parameter '" + exception.getParameterName() + "' is missing");
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<Map<String, Object>> typeMismatch(MethodArgumentTypeMismatchException exception) {
		return body(HttpStatus.BAD_REQUEST, "Invalid value for parameter '" + exception.getName() + "'");
	}

	/** Role check failed (@PreAuthorize) or the caller is outside the resource's scope. */
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<Map<String, Object>> forbidden(AccessDeniedException exception) {
		return body(HttpStatus.FORBIDDEN, "You do not have permission to perform this action");
	}

	@ExceptionHandler(DisabledException.class)
	public ResponseEntity<Map<String, Object>> disabled(DisabledException exception) {
		return body(HttpStatus.FORBIDDEN, exception.getMessage());
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<Map<String, Object>> unauthorized(AuthenticationException exception) {
		return body(HttpStatus.UNAUTHORIZED, exception.getMessage());
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<Map<String, Object>> integrity(DataIntegrityViolationException exception) {
		return body(HttpStatus.CONFLICT,
				"The request conflicts with existing data (duplicate value or record still in use)");
	}
}
