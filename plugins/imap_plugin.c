#include "imap_client.h"

#include "headers/npapi.h"
#include "headers/npfunctions.h"

#include <glib-object.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <stddef.h>

#define PLUGIN_NAME        "IMAP Client Plug-in"
#define PLUGIN_DESCRIPTION PLUGIN_NAME " (for Dualx)"
#define PLUGIN_VERSION     "0.1"

static NPNetscapeFuncs* sBrowserFuncs = NULL;

static void *pluginClass;

Imap imap;

bool plugin_has_method(NPObject *obj, NPIdentifier methodName) {
    // This function will be called when we invoke method on this plugin elements.
	NPUTF8 *name = sBrowserFuncs->utf8fromidentifier(methodName);
	if(strcmp(name, "login") == 0) {
		return true;
	} else if (strcmp(name, "append") == 0) {
		return true;
	} else if (strcmp(name, "create") == 0) {
		return true;
	} else if (strcmp(name, "logout") == 0) {
		return true;
	}
	sBrowserFuncs->memfree(name);
	return false;
}

char *arg_to_string(const NPVariant arg) {
	NPString npstr = NPVARIANT_TO_STRING(arg);
	char *str = sBrowserFuncs->memalloc(npstr.UTF8Length + 1);
	memcpy(str, npstr.UTF8Characters, npstr.UTF8Length);
	str[npstr.UTF8Length] = '\0';
	return str;
}

bool plugin_invoke(NPObject *obj, NPIdentifier methodName, const NPVariant *args, uint32_t argCount, NPVariant *result) {
    // Make sure the method called is "open".
	NPUTF8 *name = sBrowserFuncs->utf8fromidentifier(methodName);
	if(strcmp(name, "login") == 0) {
		sBrowserFuncs->memfree(name);

		char *user = arg_to_string(args[0]);
		char *pass = arg_to_string(args[1]);

		init_imap(&imap);
		BOOLEAN_TO_NPVARIANT(login(&imap, user, pass), *result);
			  
		sBrowserFuncs->memfree(user);
		sBrowserFuncs->memfree(pass);
		return true;
	} else if (strcmp(name, "logout") == 0) {
		sBrowserFuncs->memfree(name);
		
		free_imap(&imap);
		return true;
	} else if (strcmp(name, "create") == 0) {
		sBrowserFuncs->memfree(name);
		char *mailbox = arg_to_string(args[0]);

		create(&imap, mailbox);
		
		sBrowserFuncs->memfree(mailbox);
		return true;
	} else if (strcmp(name, "append") == 0) {
		sBrowserFuncs->memfree(name);

		char *mailbox = arg_to_string(args[0]);
		char *from = arg_to_string(args[1]);
		char *to = arg_to_string(args[2]); 
		char *datetime = arg_to_string(args[3]);
		char *subject = arg_to_string(args[4]);
		char *content = arg_to_string(args[5]);

		append(&imap, mailbox, from, to, datetime, subject, content);
		
		sBrowserFuncs->memfree(mailbox);
		sBrowserFuncs->memfree(from);
		sBrowserFuncs->memfree(to);
		sBrowserFuncs->memfree(datetime);
		sBrowserFuncs->memfree(subject);
		sBrowserFuncs->memfree(content);
		return true;
	}
	sBrowserFuncs->memfree(name);
	return false;
}

static struct NPClass scriptablePluginClass = {
	NP_CLASS_STRUCT_VERSION,
	NULL,
	NULL,
	NULL,
	plugin_has_method,
	plugin_invoke,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
};

NP_EXPORT(NPError)
NP_Initialize(NPNetscapeFuncs* bFuncs, NPPluginFuncs* pFuncs)
{
	sBrowserFuncs = bFuncs;
	g_type_init();
	
	if (pFuncs->size < (offsetof(NPPluginFuncs, setvalue) + sizeof(void*)))
		return NPERR_INVALID_FUNCTABLE_ERROR;

	pFuncs->newp = NPP_New;
	pFuncs->destroy = NPP_Destroy;
	pFuncs->setwindow = NPP_SetWindow;
	pFuncs->newstream = NPP_NewStream;
	pFuncs->destroystream = NPP_DestroyStream;
	pFuncs->asfile = NPP_StreamAsFile;
	pFuncs->writeready = NPP_WriteReady;
	pFuncs->write = NPP_Write;
	pFuncs->print = NPP_Print;
	pFuncs->event = NPP_HandleEvent;
	pFuncs->urlnotify = NPP_URLNotify;
	pFuncs->getvalue = NPP_GetValue;
	pFuncs->setvalue = NPP_SetValue;

	return NPERR_NO_ERROR;
}

NP_EXPORT(char*)
NP_GetPluginVersion()
{
	return PLUGIN_VERSION;
}

NP_EXPORT(const char*)
NP_GetMIMEDescription()
{
	return "application/imap-client-plugin:imap:IMAP Client plugin";
}


NP_EXPORT(NPError)
NP_GetValue(void* future, NPPVariable aVariable, void* aValue) {
	switch (aVariable) {
	case NPPVpluginNameString:
		*((char**)aValue) = PLUGIN_NAME;
		break;
	case NPPVpluginDescriptionString:
		*((char**)aValue) = PLUGIN_DESCRIPTION;
		break;
	default:
		return NPERR_INVALID_PARAM;
		break;
	}
	return NPERR_NO_ERROR;
}

NP_EXPORT(NPError)
NP_Shutdown()
{
	return NPERR_NO_ERROR;
}

NPError
NPP_New(NPMIMEType pluginType, NPP instance, uint16_t mode, int16_t argc, char* argn[], char* argv[], NPSavedData* saved) {
	NPBool browserSupportsWindowless = false;
	sBrowserFuncs->getvalue(instance, NPNVSupportsWindowless, &browserSupportsWindowless);
	if (!browserSupportsWindowless) {
		printf("Windowless mode not supported by the browser\n");
		return NPERR_GENERIC_ERROR;
	}
	
	pluginClass = sBrowserFuncs->createobject(instance, &scriptablePluginClass);

	sBrowserFuncs->setvalue(instance, NPPVpluginWindowBool, (void*)false);
	return NPERR_NO_ERROR;
}

NPError
NPP_Destroy(NPP instance, NPSavedData** save) {
	sBrowserFuncs->releaseobject(pluginClass);
	return NPERR_NO_ERROR;
}

NPError
NPP_SetWindow(NPP instance, NPWindow* window) {
	return NPERR_NO_ERROR;
}

NPError
NPP_NewStream(NPP instance, NPMIMEType type, NPStream* stream, NPBool seekable, uint16_t* stype) {
	return NPERR_GENERIC_ERROR;
}

NPError
NPP_DestroyStream(NPP instance, NPStream* stream, NPReason reason) {
	return NPERR_GENERIC_ERROR;
}

int32_t
NPP_WriteReady(NPP instance, NPStream* stream) {
	return 0;
}

int32_t
NPP_Write(NPP instance, NPStream* stream, int32_t offset, int32_t len, void* buffer) {
	return 0;
}

void
NPP_StreamAsFile(NPP instance, NPStream* stream, const char* fname) {

}

void
NPP_Print(NPP instance, NPPrint* platformPrint) {

}

int16_t
NPP_HandleEvent(NPP instance, void* event) {
  return 0;
}

void
NPP_URLNotify(NPP instance, const char* URL, NPReason reason, void* notifyData) {

}

NPError
NPP_GetValue(NPP instance, NPPVariable variable, void *value) {
	switch (variable) {
	case NPPVpluginScriptableNPObject: {
		*(NPObject **)value = pluginClass;
	}
	break;
	default:
	return NPERR_GENERIC_ERROR;
	}
	return NPERR_NO_ERROR;
}

NPError
NPP_SetValue(NPP instance, NPNVariable variable, void *value) {
	return NPERR_GENERIC_ERROR;
}
