package com.profai.backend;

import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.boot.SpringApplication;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mockStatic;

class BackendApplicationTests {

	@Test
	void applicationClassCanBeConstructed() {
		assertThat(new BackendApplication()).isNotNull();
	}

	@Test
	void mainMethodStartsSpringApplication() {
		try (MockedStatic<SpringApplication> springApplication = mockStatic(SpringApplication.class)) {
			String[] args = {"--server.port=0"};

			BackendApplication.main(args);

			springApplication.verify(() -> SpringApplication.run(BackendApplication.class, args));
		}
	}

}
