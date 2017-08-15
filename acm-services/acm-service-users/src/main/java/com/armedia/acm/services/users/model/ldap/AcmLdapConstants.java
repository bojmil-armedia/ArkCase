package com.armedia.acm.services.users.model.ldap;

public interface AcmLdapConstants
{
    int RETRY_ATTEMPTS = 3;
    long RETRY_TIMEOUT = 500L;
    String DEFAULT_AUDIT_USER = "LDAP-SYNC";
    String LDAP_FULL_NAME_ATTR = "fullName";
    String LDAP_FIRST_NAME_ATTR = "firstName";
    String LDAP_LAST_NAME_ATTR = "lastName";
    String LDAP_USER_ID_ATTR = "userId";
    String LDAP_MAIL_ATTR = "mail";
    String LDAP_MEMBER_ATTR = "member";
    String LDAP_PASSWORD_ATTR = "password";
    String LDAP_UNICODE_PASSWORD_ATTR = "unicodePassword";
    String LDAP_UID_NUMBER_ATTR = "uidNumber";
    String LDAP_GID_NUMBER_ATTR = "gidNumber";
    String LDAP_HOME_DIRECTORY_ATTR = "homeDirectory";
    String LDAP_OBJECT_CLASS_ATTR = "objectClass";
    String LDAP_LAST_SYNC_PROPERTY_KEY = "ldap.sync.last.run.date";
}
