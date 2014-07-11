package com.armedia.acm.services.users.model;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.transaction.TransactionConfiguration;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

import static org.junit.Assert.*;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {
        "/spring/spring-library-data-source.xml"
})
@TransactionConfiguration(defaultRollback = false)
public class ParticipantJpaIT
{
    @PersistenceContext
    private EntityManager entityManager;

    private final Logger log = LoggerFactory.getLogger(getClass());

    private String objectType = "TEST OBJECT TYPE";
    private Long objectId = 500L;
    private String participantLdapId = "TEST ACCESSOR ID";
    private String participantType = "TEST PARTICIPANT TYPE";

    @Before
    public void setUp() throws Exception
    {
        String deleteParticipant = "DELETE FROM AcmParticipant a " +
                "WHERE  a.objectType = :objectType " +
                "AND a.objectId = :objectId " +
                "AND a.participantType = :participantType " +
                "AND a.participantLdapId = :participantLdapId";
        Query deleteParticipantQuery = entityManager.createQuery(deleteParticipant);
        deleteParticipantQuery.setParameter("participantLdapId", participantLdapId);
        deleteParticipantQuery.setParameter("objectId", objectId);
        deleteParticipantQuery.setParameter("participantType", participantType);
        deleteParticipantQuery.setParameter("objectType", objectType);

        deleteParticipantQuery.executeUpdate();
    }

    @Test
    @Transactional
    public void storeParticipant()
    {
        AcmParticipant acmParticipant = new AcmParticipant();
        acmParticipant.setCreator("creator");
        acmParticipant.setModifier("modifier");
        acmParticipant.setObjectType(objectType);
        acmParticipant.setObjectId(objectId);
        acmParticipant.setParticipantLdapId(participantLdapId);
        acmParticipant.setParticipantType(participantType);

        entityManager.persist(acmParticipant);

        entityManager.flush();

        assertNotNull(acmParticipant.getId());

    }
}
