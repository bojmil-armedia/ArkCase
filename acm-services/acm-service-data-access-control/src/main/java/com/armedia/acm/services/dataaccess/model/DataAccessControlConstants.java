package com.armedia.acm.services.dataaccess.model;

/*-
 * #%L
 * ACM Service: Data Access Control
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

import com.armedia.acm.objectonverter.DateFormats;

/**
 * Created by armdev on 2/16/15.
 */
public interface DataAccessControlConstants
{
    String ACCESS_MANDATORY = "mandatory";
    String ACCESS_GRANT = "grant";
    String ACCESS_DENY = "deny";
    String ACCESS_LEVEL_PARTICIPANT_TYPE_SEPARATOR = "to";
    String ACCESS_REASON_POLICY = "policy";
    String DEFAULT_ACCESSOR = "*";
    String ACCESS_LEVEL_READ = "read";

    String LAST_RUN_DATE_FORMAT = DateFormats.DEFAULT_DATE_FORMAT;
}
