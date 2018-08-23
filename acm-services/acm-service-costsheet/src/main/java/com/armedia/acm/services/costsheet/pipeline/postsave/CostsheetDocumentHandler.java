/**
 *
 */
package com.armedia.acm.services.costsheet.pipeline.postsave;

/*-
 * #%L
 * ACM Default Plugin: Complaints
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

import static com.armedia.acm.services.costsheet.model.CostsheetConstants.FILE_ID;
import static com.armedia.acm.services.costsheet.model.CostsheetConstants.NEW_FILE;

import com.armedia.acm.core.exceptions.AcmObjectNotFoundException;
import com.armedia.acm.core.exceptions.AcmUserActionFailedException;
import com.armedia.acm.form.config.FormsTypeCheckService;
import com.armedia.acm.services.costsheet.dao.AcmCostsheetDao;
import com.armedia.acm.services.costsheet.model.AcmCostsheet;
import com.armedia.acm.services.costsheet.pipeline.CostsheetPipelineContext;
import com.armedia.acm.services.costsheet.service.PDFCostsheetDocumentGenerator;
import com.armedia.acm.services.pipeline.exception.PipelineProcessException;
import com.armedia.acm.services.pipeline.handler.PipelineHandler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.parsers.ParserConfigurationException;

public class CostsheetDocumentHandler extends PDFCostsheetDocumentGenerator<AcmCostsheetDao, AcmCostsheet>
        implements PipelineHandler<AcmCostsheet, CostsheetPipelineContext>
{

    private transient final Logger log = LoggerFactory.getLogger(getClass());
    private FormsTypeCheckService formsTypeCheckService;

    @Override
    public void execute(AcmCostsheet costsheet, CostsheetPipelineContext ctx) throws PipelineProcessException
    {

        if (!formsTypeCheckService.getTypeOfForm().equals("frevvo"))
        {

            log.debug("Entering pipeline handler for costsheet with id [{}] and title [{}]", costsheet.getId(), costsheet.getTitle());

            // ensure the SQL of all prior handlers is visible to this handler
            getDao().getEm().flush();

            try
            {
                generatePdf(costsheet.getId(), ctx);
            }
            catch (ParserConfigurationException e)
            {
                log.warn("Unable to generate pdf document for the costsheet with id [{}] and title [{}]", costsheet.getId(),
                        costsheet.getTitle());
                throw new PipelineProcessException(e);
            }

            log.debug("Exiting pipeline handler for costsheet with id [{}] and title [{}]", costsheet.getId(), costsheet.getTitle());
        }
    }

    @Override
    public void rollback(AcmCostsheet costsheet, CostsheetPipelineContext ctx) throws PipelineProcessException
    {
        if (ctx.hasProperty(NEW_FILE))
        {
            boolean newFile = (boolean) ctx.getPropertyValue(NEW_FILE);
            if (newFile)
            {
                if (ctx.hasProperty(FILE_ID))
                {
                    Long fileId = (Long) ctx.getPropertyValue(FILE_ID);
                    try
                    {
                        getEcmFileService().deleteFile(fileId);
                    }
                    catch (AcmUserActionFailedException | AcmObjectNotFoundException e)
                    {
                        log.warn("Unable to delete ecm file with id [{}] for the costsheet with id [{}] and title [{}]", fileId,
                                costsheet.getId(),
                                costsheet.getTitle());
                        throw new PipelineProcessException(e);
                    }
                }
            }
        }
    }

    public void setFormsTypeCheckService(FormsTypeCheckService formsTypeCheckService)
    {
        this.formsTypeCheckService = formsTypeCheckService;
    }
}