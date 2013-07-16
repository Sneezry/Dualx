#include "imap_client.h"
#include <gio/gio.h>
#include <glib.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>

void init_imap(Imap *imap) {
	imap->tag = 0;
	imap->buffer = g_string_sized_new(1024);
	GSocketClient *client = g_socket_client_new();
	GSocketConnection *conn = g_socket_client_connect_to_host(client, "imap.qq.com", 143, NULL, NULL);
	GSocket *socket = g_socket_connection_get_socket(conn);
	int fd = g_socket_get_fd(socket);
	imap->channel = g_io_channel_unix_new(fd);
	GIOFlags flags = g_io_channel_get_flags(imap->channel);
	flags = (GIOFlags) (flags^G_IO_FLAG_NONBLOCK);
	g_io_channel_set_flags(imap->channel, flags, NULL);
	g_io_channel_set_encoding(imap->channel, "gbk", NULL);
	g_io_channel_read_line_string(imap->channel, imap->buffer, NULL, NULL);
	
	g_object_unref(client);
	
	imap->tagre = g_regex_new("(?<tag>a\\d+) (?<type>[A-Z]+) (?<data>.*)", (GRegexCompileFlags)0, (GRegexMatchFlags)0, NULL);
}

void free_imap(Imap *imap) {
	g_string_free(imap->buffer, TRUE);
	g_io_channel_shutdown(imap->channel, FALSE, NULL);
	g_io_channel_unref(imap->channel);
	
	g_regex_unref(imap->tagre);
}
	
gboolean send_command(Imap *imap, const gchar *cmd, const gchar *format, ...) {
	gsize sent_size;
	gboolean rtv = FALSE;
	
	va_list args;
	va_start(args, format);
	g_string_printf(imap->buffer, "a%d %s ", imap->tag++, cmd);
	g_string_append_vprintf(imap->buffer, format, args);
	g_string_append_printf(imap->buffer, "\r\n");
	
	g_io_channel_write_chars(imap->channel, imap->buffer->str, imap->buffer->len, &sent_size, NULL);		
	g_io_channel_flush(imap->channel, NULL);
	g_io_channel_read_line_string(imap->channel, imap->buffer, NULL, NULL);
	
	GMatchInfo *match;
	g_regex_match(imap->tagre, imap->buffer->str, (GRegexMatchFlags)0, &match);
	
	gchar *type = g_match_info_fetch_named(match, "type");
	if (type != NULL && strcmp(type, "OK") == 0)
		rtv = TRUE;
	
	g_free(type);
	g_match_info_free(match);
	
	return rtv;
}
	
void send_literal(Imap *imap, const gchar *message) {
	gsize sent_size;
	g_string_printf(imap->buffer, "%s", message);
	g_io_channel_write_chars(imap->channel, imap->buffer->str, imap->buffer->len, &sent_size, NULL);
	g_io_channel_flush(imap->channel, NULL);
	g_io_channel_read_line_string(imap->channel, imap->buffer, NULL, NULL);
}
	
gboolean login(Imap *imap, const gchar *username, const gchar *password) {
	return send_command(imap, "login", "%s %s", username, password);
}
	
/*gboolean select(Imap *imap, const gchar *mailbox) {
	send_command(imap, "select", "%s", mailbox);
}*/
	
gboolean create(Imap *imap, const gchar *mailbox) {
	return send_command(imap, "create", "%s", mailbox);
}
	
static GString *base64_encode(const guchar *data, gboolean header) {
	int len = strlen((gchar *)data);
	GString *content = g_string_new(NULL);
	gchar *data_base64 = g_base64_encode(data, len);
	if (header)
		g_string_printf(content, "=?utf-8?b?%s?=", data_base64);
	else
		g_string_printf(content, "%s", data_base64);
	g_free(data_base64);
	return content;
}
	
static void append_subject(GString *message, const gchar *subject) {
	GString *subject_base64 = base64_encode((guchar *)subject, TRUE);
	g_string_append_printf(message, "Subject: %s\r\n", subject_base64->str);
	g_string_free(subject_base64, TRUE);
}
	
static void append_datetime(GString *message, const gchar *datetime) {
	//GDateTime *gdatetime = g_date_time_new_from_unix_local(datetime);
	//gchar *datetime_str = g_date_time_format(datetime, "%a, %d %b %Y %T %z (%Z)");
	g_string_append_printf(message, "Date: %s\r\n", datetime);
	//g_free(datetime_str);
	//g_date_time_unref(gdatetime);
}
	
static void append_content(GString *message, const gchar *content) {
	GString *content_base64 = base64_encode((guchar *)content, FALSE);
	g_string_append_printf(message, "\r\n%s\r\n", content_base64->str);
	g_string_free(content_base64, TRUE);
}
	
static void append_from_address(GString *message, const gchar *from) {
	//GString *name_base64 = base64_encode((guchar *)name, TRUE);
	g_string_append_printf(message, "From: %s\r\n", from);
	//g_string_free(name_base64, TRUE);
}
	
static void append_to_address(GString *message, const gchar *to) {
	g_string_append_printf(message, "To: %s\r\n", to);
}

void append_message_id(GString *message) {
	GDateTime *gdatetime = g_date_time_new_now_local();
	g_string_append_printf(message, "Message-Id: %ld.%d@Dualx\r\n", g_date_time_to_unix(gdatetime), g_date_time_get_microsecond(gdatetime));
	g_date_time_unref(gdatetime);
}
	
gboolean append(Imap *imap, const gchar *mailbox, const gchar *from, const gchar *to, const gchar *datetime, const gchar *subject, const gchar *content) {
	GString *message = g_string_new(NULL);
	
	g_string_append_printf(message, "Content-Type: text/plain; charset=UTF-8\r\n");
	g_string_append_printf(message, "MIME-Version: 1.0\r\n");
	g_string_append_printf(message, "Content-Transfer-Encoding: base64\r\n");
	
	append_from_address(message, from);
	append_to_address(message, to);
	append_datetime(message, datetime);		
	append_subject(message, subject);
	append_message_id(message);
	append_content(message, content);
	
	send_command(imap, "append", "%s (\\Seen) {%d}", mailbox, message->len);
	send_literal(imap, message->str);
	
	g_string_free(message, TRUE);
	
	return TRUE;
}
