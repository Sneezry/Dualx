#ifndef IMAP_CLIENT_H
#define IMAP_CLIENT_H

#include <glib.h>
typedef struct {
	int tag;
	GIOChannel *channel;
	GString *buffer;
	GRegex *tagre;
} Imap;

void init_imap(Imap *imap);
void free_imap(Imap *imap);

gboolean login(Imap *imap, const gchar *username, const gchar *password);
gboolean create(Imap *imap, const gchar *mailbox);
gboolean append(Imap *imap, const gchar *mailbox, const gchar *from, const gchar *to, const gchar *datetime, const gchar *subject, const gchar *content);

#endif
