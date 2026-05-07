package com.profai.backend;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("TestController unit tests")
class TestControllerTest {

    @Test
    void healthReturnsOk() {
        TestController controller = new TestController(mock(JdbcTemplate.class));

        assertThat(controller.health()).isEqualTo("OK");
    }

    @Test
    void dbCheckUsesJdbcTemplate() {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        when(jdbcTemplate.queryForObject("SELECT 1", Integer.class)).thenReturn(1);

        assertThat(new TestController(jdbcTemplate).dbCheck()).isEqualTo("DB OK: 1");
    }
}
