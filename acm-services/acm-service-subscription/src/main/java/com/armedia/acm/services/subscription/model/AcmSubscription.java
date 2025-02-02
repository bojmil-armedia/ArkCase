package com.armedia.acm.services.subscription.model;

/*-
 * #%L
 * ACM Service: Subscription
 * %%
 * Copyright (C) 2014 - 2018 ArkCase LLC
 * %%
 * This file is part of the ArkCase software. 
 * 
 * If the software was purchased under a paid ArkCase license, the terms of 
 * the paid license agreement will prevail.  Otherwise, the software is 
 * provided under the following open source license terms:
 * 
 * ArkCase is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *  
 * ArkCase is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with ArkCase. If not, see <http://www.gnu.org/licenses/>.
 * #L%
 */

import com.armedia.acm.core.AcmObject;
import com.armedia.acm.data.AcmEntity;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.voodoodyne.jackson.jsog.JSOGGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.TableGenerator;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import java.util.Date;

/**
 * Created by marjan.stefanoski on 29.01.2015.
 */
@Entity
@Table(name = "acm_subscription")
@JsonIdentityInfo(generator = JSOGGenerator.class)
public class AcmSubscription implements AcmObject, AcmEntity
{

    @Id
    @TableGenerator(name = "acm_subscription_gen", table = "acm_subscription_id", pkColumnName = "cm_seq_name", valueColumnName = "cm_seq_num", pkColumnValue = "acm_subscription", initialValue = 100, allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.TABLE, generator = "acm_subscription_gen")
    @Column(name = "cm_subscription_id")
    private Long subscriptionId;

    @Column(name = "cm_user_id", nullable = false, insertable = true, updatable = false)
    private String userId;

    @Column(name = "cm_object_id", nullable = false, insertable = true, updatable = false)
    private Long objectId;

    @Column(name = "cm_object_type", nullable = false, insertable = true, updatable = false)
    private String subscriptionObjectType;

    @Column(name = "cm_object_name", nullable = false)
    private String objectName;

    @Column(name = "cm_object_title", nullable = false)
    private String objectTitle;

    @Column(name = "cm_subscription_creator", nullable = false, insertable = true, updatable = false)
    private String creator;

    @Column(name = "cm_subscription_modifier", nullable = false, insertable = true, updatable = true)
    private String modifier;

    @Column(name = "cm_subscription_created", nullable = false, insertable = true, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date created;

    @Column(name = "cm_subscription_modified", nullable = false, insertable = true, updatable = true)
    @Temporal(TemporalType.TIMESTAMP)
    private Date modified;

    public Long getSubscriptionId()
    {
        return subscriptionId;
    }

    public void setSubscriptionId(Long subscriptionId)
    {
        this.subscriptionId = subscriptionId;
    }

    public Long getObjectId()
    {
        return objectId;
    }

    public void setObjectId(Long objectId)
    {
        this.objectId = objectId;
    }

    public String getSubscriptionObjectType()
    {
        return subscriptionObjectType;
    }

    public void setSubscriptionObjectType(String subscriptionObjectType)
    {
        this.subscriptionObjectType = subscriptionObjectType;
    }

    public String getObjectName()
    {
        return objectName;
    }

    public void setObjectName(String objectName)
    {
        this.objectName = objectName;
    }

    public String getUserId()
    {
        return userId;
    }

    public void setUserId(String userId)
    {
        this.userId = userId;
    }

    public String getObjectTitle()
    {
        return objectTitle;
    }

    public void setObjectTitle(String objectTitle)
    {
        this.objectTitle = objectTitle;
    }

    @Override
    public String getCreator()
    {
        return creator;
    }

    @Override
    public void setCreator(String creator)
    {
        this.creator = creator;
    }

    @Override
    public String getModifier()
    {
        return modifier;
    }

    @Override
    public void setModifier(String modifier)
    {
        this.modifier = modifier;
    }

    @Override
    public Date getCreated()
    {
        return created;
    }

    @Override
    public void setCreated(Date created)
    {
        this.created = created;
    }

    @Override
    public Date getModified()
    {
        return modified;
    }

    @Override
    public void setModified(Date modified)
    {
        this.modified = modified;
    }

    @Override
    @JsonIgnore
    public String getObjectType()
    {
        return SubscriptionConstants.OBJECT_TYPE;
    }

    @Override
    @JsonIgnore
    public Long getId()
    {
        return subscriptionId;
    }
}
