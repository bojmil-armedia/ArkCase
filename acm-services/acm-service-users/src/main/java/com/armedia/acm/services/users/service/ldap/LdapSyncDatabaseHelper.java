package com.armedia.acm.services.users.service.ldap;

import com.armedia.acm.services.users.dao.group.AcmGroupDao;
import com.armedia.acm.services.users.dao.ldap.UserDao;
import com.armedia.acm.services.users.model.AcmRole;
import com.armedia.acm.services.users.model.AcmUser;
import com.armedia.acm.services.users.model.AcmUserRole;
import com.armedia.acm.services.users.model.group.AcmGroup;
import com.armedia.acm.services.users.model.group.AcmGroupStatus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created by armdev on 5/29/14.
 */
public class LdapSyncDatabaseHelper
{
    private static final String ROLE_TYPE_APPLICATION_ROLE = "APPLICATION_ROLE";
    private static final String ROLE_TYPE_LDAP_GROUP = "LDAP_GROUP";
    private UserDao userDao;
    private AcmGroupDao groupDao;
    private Logger log = LoggerFactory.getLogger(getClass());

    @Transactional
    public void updateDatabase(String directoryName,
                               Set<String> allRoles,
                               List<AcmUser> users,
                               Map<String, Set<AcmUser>> usersByRole,
                               Map<String, Set<AcmUser>> usersByLdapGroup,
                               Map<String, String> childParentPair,
                               boolean singleUser)
    {
        if (!singleUser)
        {
            // Mark all users invalid... users still in LDAP will change to valid during the sync
            getUserDao().markAllUsersInvalid(directoryName);
            getUserDao().markAllRolesInvalid(directoryName);
            getGroupDao().markAllGroupsInactive(ROLE_TYPE_LDAP_GROUP);

            persistApplicationRoles(allRoles, ROLE_TYPE_APPLICATION_ROLE, null);
        }
        persistApplicationRoles(usersByLdapGroup.keySet(), ROLE_TYPE_LDAP_GROUP, childParentPair);

        persistUsers(directoryName, users);

        storeRoles(usersByRole);
        storeRoles(usersByLdapGroup);
    }

    private void storeRoles(Map<String, Set<AcmUser>> userMap)
    {
        for (Map.Entry<String, Set<AcmUser>> userMapEntry : userMap.entrySet())
        {
            persistUserRoles(userMapEntry.getValue(), userMapEntry.getKey());
        }
    }

    private List<AcmUserRole> persistUserRoles(Set<AcmUser> savedUsers, String roleName)
    {
        List<AcmUserRole> retval = new ArrayList<>(savedUsers.size());

        Set<AcmUser> users = new HashSet<>();

        for (AcmUser user : savedUsers)
        {
            log.debug("persisting user role '{}' -> '{}'", user.getUserId(), roleName);

            AcmUserRole role = new AcmUserRole();
            role.setUserId(user.getUserId());
            role.setRoleName(roleName);

            role = getUserDao().saveAcmUserRole(role);
            retval.add(role);

            AcmUser _user = getUserDao().findByUserId(user.getUserId());
            users.add(_user);
        }

        AcmGroup group = getGroupDao().findByName(roleName);
        if (group != null)
        {
            group.setMembers(users);
            getGroupDao().save(group);
        }

        return retval;
    }

    protected List<AcmUser> persistUsers(String directoryName, List<AcmUser> users)
    {
        List<AcmUser> retval = new ArrayList<>(users.size());

        for (AcmUser user : users)
        {
            log.debug("Persisting user '{}'", user.getUserId());

            user.setUserDirectoryName(directoryName);
            AcmUser saved = getUserDao().saveAcmUser(user);
            retval.add(saved);
        }
        return retval;
    }

    protected void persistApplicationRoles(Set<String> applicationRoles, String roleType, Map<String, String> childParentPair)
    {
        for (String role : applicationRoles)
        {
            log.debug("Persisting role '{}'", role);
            AcmRole jpaRole = new AcmRole();
            jpaRole.setRoleName(role);
            jpaRole.setRoleType(roleType);
            getUserDao().saveAcmRole(jpaRole);

            if (ROLE_TYPE_LDAP_GROUP.equals(roleType))
            {
                // Find or create parent group if exist
                AcmGroup parentGroup = null;
                if (childParentPair != null && childParentPair.containsKey(role))
                {
                    String parentName = childParentPair.get(role);
                    parentGroup = getGroupDao().findByName(parentName);

                    if (parentGroup == null)
                    {
                        parentGroup = new AcmGroup();
                    }

                    parentGroup.setName(parentName);
                    parentGroup.setType(ROLE_TYPE_LDAP_GROUP);

                    if (!AcmGroupStatus.DELETE.equals(parentGroup.getStatus()))
                    {
                        parentGroup.setStatus(AcmGroupStatus.ACTIVE);
                    }
                }

                // Save group with parent group (if parent group exist, otherwise just save the group)
                AcmGroup group = getGroupDao().findByName(role);

                if (group == null)
                {
                    group = new AcmGroup();

                }
                group.setName(role);
                group.setType(roleType);
                group.setParentGroup(parentGroup);
                if (!AcmGroupStatus.DELETE.equals(group.getStatus()))
                {
                    group.setStatus(AcmGroupStatus.ACTIVE);
                }

                getGroupDao().save(group);
            }
        }
    }

    public UserDao getUserDao()
    {
        return userDao;
    }

    public void setUserDao(UserDao userDao)
    {
        this.userDao = userDao;
    }

    public AcmGroupDao getGroupDao()
    {
        return groupDao;
    }

    public void setGroupDao(AcmGroupDao groupDao)
    {
        this.groupDao = groupDao;
    }
}
