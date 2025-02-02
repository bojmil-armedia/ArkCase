package com.armedia.acm.plugins.ecm.web.api;

/*-
 * #%L
 * ACM Service: Enterprise Content Management
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

import com.armedia.acm.core.exceptions.AcmUserActionFailedException;
import com.armedia.acm.plugins.ecm.model.AcmFolderConstants;
import com.armedia.acm.plugins.ecm.model.EcmFile;
import com.armedia.acm.plugins.ecm.model.EcmFileConstants;
import com.armedia.acm.plugins.ecm.model.EcmFileVersion;
import com.armedia.acm.plugins.ecm.service.EcmFileService;
import com.armedia.acm.plugins.ecm.service.EcmFileTransaction;
import com.armedia.acm.plugins.ecm.service.FileEventPublisher;
import com.armedia.acm.plugins.ecm.utils.FolderAndFilesUtils;

import org.mule.api.MuleException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.servlet.http.HttpSession;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * Created by marjan.stefanoski on 06.04.2015.
 */
@Controller
@RequestMapping({ "/api/v1/service/ecm", "/api/latest/service/ecm" })
public class ReplaceFileAPIController
{

    private transient final Logger log = LoggerFactory.getLogger(getClass());
    private EcmFileService fileService;
    private EcmFileTransaction fileTransaction;
    private FileEventPublisher fileEventPublisher;
    private FolderAndFilesUtils folderAndFilesUtils;

    @PreAuthorize("hasPermission(#fileToBeReplacedId, 'FILE', 'write|group-write')")
    @RequestMapping(value = "/replace/{fileToBeReplacedId}", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public EcmFile replaceFile(@PathVariable("fileToBeReplacedId") Long fileToBeReplacedId, MultipartHttpServletRequest request,
            Authentication authentication, HttpSession session) throws AcmUserActionFailedException
    {

        log.info("Replacing file, fileId: {}", fileToBeReplacedId);
        String ipAddress = (String) session.getAttribute(EcmFileConstants.IP_ADDRESS_ATTRIBUTE);

        EcmFile fileToBeReplaced = getFileService().findById(fileToBeReplacedId);
        if (fileToBeReplaced == null)
        {
            log.debug("File, fileId: {} does not exist, and can not be replaced", fileToBeReplacedId);
            getFileEventPublisher().publishFileReplacedEvent(null, null, authentication, ipAddress, false);
            throw new AcmUserActionFailedException(EcmFileConstants.USER_ACTION_REPLACE_FILE, EcmFileConstants.OBJECT_FILE_TYPE,
                    fileToBeReplacedId, "File not found.", null);
        }

        EcmFileVersion fileToBeReplacedVersion = getFolderAndFilesUtils().getVersion(fileToBeReplaced, fileToBeReplaced.getActiveVersionTag());
        EcmFile replacedFile;

        try (InputStream replacementStream = getInputStreamFromAttachment(request, fileToBeReplacedId))
        {
            if (replacementStream == null)
            {
                throw new AcmUserActionFailedException(EcmFileConstants.USER_ACTION_REPLACE_FILE, EcmFileConstants.OBJECT_FILE_TYPE,
                        fileToBeReplacedId, "No stream found!.", null);
            }

            replacedFile = getFileTransaction().updateFileTransactionEventAware(authentication, fileToBeReplaced, replacementStream);
            getFileEventPublisher().publishFileReplacedEvent(replacedFile, fileToBeReplacedVersion, authentication, ipAddress, true);
        }
        catch (MuleException | IOException e)
        {
            log.error("Exception occurred while trying to replace file: {}, {}", fileToBeReplaced.getFileName(), e.getMessage(),
                    e);
            getFileEventPublisher().publishFileReplacedEvent(fileToBeReplaced, fileToBeReplacedVersion, authentication, ipAddress, false);
            throw new AcmUserActionFailedException(EcmFileConstants.USER_ACTION_REPLACE_FILE, EcmFileConstants.OBJECT_FILE_TYPE,
                    fileToBeReplacedId, e.getMessage(), e);

        }
        return replacedFile;
    }

    private InputStream getInputStreamFromAttachment(MultipartHttpServletRequest request, Long fileToBeReplacedId)
            throws AcmUserActionFailedException, IOException
    {
        MultiValueMap<String, MultipartFile> attachments = request.getMultiFileMap();
        if (attachments != null)
        {
            for (Map.Entry<String, List<MultipartFile>> entry : attachments.entrySet())
            {
                final List<MultipartFile> attachmentsList = entry.getValue();
                if (attachmentsList != null && !attachmentsList.isEmpty())
                {
                    return attachmentsList.get(AcmFolderConstants.ZERO).getInputStream();
                }
            }
        }
        log.debug("No File uploaded, nothing to be changed");
        throw new AcmUserActionFailedException(EcmFileConstants.USER_ACTION_REPLACE_FILE, EcmFileConstants.OBJECT_FILE_TYPE,
                fileToBeReplacedId, "No file attached found.", null);
    }

    public FileEventPublisher getFileEventPublisher()
    {
        return fileEventPublisher;
    }

    public void setFileEventPublisher(FileEventPublisher fileEventPublisher)
    {
        this.fileEventPublisher = fileEventPublisher;
    }

    public EcmFileTransaction getFileTransaction()
    {
        return fileTransaction;
    }

    public void setFileTransaction(EcmFileTransaction fileTransaction)
    {
        this.fileTransaction = fileTransaction;
    }

    public EcmFileService getFileService()
    {
        return fileService;
    }

    public void setFileService(EcmFileService fileService)
    {
        this.fileService = fileService;
    }

    public FolderAndFilesUtils getFolderAndFilesUtils()
    {
        return folderAndFilesUtils;
    }

    public void setFolderAndFilesUtils(FolderAndFilesUtils folderAndFilesUtils)
    {
        this.folderAndFilesUtils = folderAndFilesUtils;
    }
}
