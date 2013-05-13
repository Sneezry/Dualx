CFLAGS = -Wall -DXP_UNIX=1 -fPIC `pkg-config --cflags glib-2.0 gio-2.0`
LIBS = `pkg-config --libs glib-2.0 gio-2.0`

all: npimapplugin.so 
npimapplugin.so: imap_plugin.o imap_client.o
	cc $(CFLAGS) -shared imap_plugin.o imap_client.o -o npimapplugin.so

imap_plugin.o: imap_plugin.c
	cc $(CFLAGS) -c imap_plugin.c

imap_client.o: imap_client.c imap_client.h
	cc $(CFLAGS) -c imap_client.c

clean:
	rm npimapplugin.so imap_plugin.o imap_client.o
	
