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

import static org.easymock.EasyMock.anyString;
import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.expect;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import com.armedia.acm.email.model.EmailSenderConfig;
import com.armedia.acm.files.propertymanager.PropertyFileManager;
import com.armedia.acm.muletools.mulecontextmanager.MuleContextManager;
import com.armedia.acm.objectonverter.ObjectConverter;
import com.armedia.acm.plugins.ecm.dao.EcmFileDao;
import com.armedia.acm.plugins.ecm.model.AcmContainer;
import com.armedia.acm.plugins.ecm.model.EcmFile;
import com.armedia.acm.plugins.ecm.model.EcmFileConstants;
import com.armedia.acm.plugins.ecm.model.EcmFileDownloadedEvent;
import com.armedia.acm.plugins.ecm.model.EcmFileVersion;
import com.armedia.acm.plugins.ecm.utils.CmisConfigUtils;
import com.armedia.acm.plugins.ecm.utils.FolderAndFilesUtils;

import org.apache.chemistry.opencmis.commons.data.ContentStream;
import org.easymock.Capture;
import org.easymock.EasyMockSupport;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mule.api.MuleMessage;
import org.mule.module.cmis.connectivity.CMISCloudConnectorConnectionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.servlet.mvc.method.annotation.ExceptionHandlerExceptionResolver;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "/spring/spring-library-ecm-plugin-test.xml", "/spring/spring-web-acm-web.xml" })
public class FileDownloadAPIControllerTest extends EasyMockSupport
{
    private MockMvc mockMvc;
    private MockHttpSession mockHttpSession;

    private FileDownloadAPIController unit;

    private EcmFileDao mockFileDao;
    private Authentication mockAuthentication;
    private ApplicationEventPublisher mockEventPublisher;
    private MuleContextManager mockMuleContextManager;
    private MuleMessage mockMuleMessage;
    private ContentStream mockContentStream;
    private FolderAndFilesUtils mockFolderAndFilesUtils;
    private CmisConfigUtils mockCmisConfigUtils;
    private PropertyFileManager mockPropertyFileManager;
    private EmailSenderConfig mockEmailSenderConfig;

    @Autowired
    private ExceptionHandlerExceptionResolver exceptionResolver;

    private Logger log = LoggerFactory.getLogger(getClass());

    @Before
    public void setUp() throws Exception
    {
        mockFileDao = createMock(EcmFileDao.class);
        mockHttpSession = new MockHttpSession();
        mockAuthentication = createMock(Authentication.class);
        mockEventPublisher = createMock(ApplicationEventPublisher.class);
        mockMuleContextManager = createMock(MuleContextManager.class);
        mockMuleMessage = createMock(MuleMessage.class);
        mockContentStream = createMock(ContentStream.class);
        mockFolderAndFilesUtils = createMock(FolderAndFilesUtils.class);
        mockCmisConfigUtils = createMock(CmisConfigUtils.class);
        mockPropertyFileManager = createMock(PropertyFileManager.class);
        mockEmailSenderConfig = createMock(EmailSenderConfig.class);

        unit = new FileDownloadAPIController();

        unit.setFileDao(mockFileDao);
        unit.setApplicationEventPublisher(mockEventPublisher);
        unit.setMuleContextManager(mockMuleContextManager);
        unit.setFolderAndFilesUtils(mockFolderAndFilesUtils);
        unit.setCmisConfigUtils(mockCmisConfigUtils);
        unit.setObjectConverter(ObjectConverter.createObjectConverterForTests());
        unit.setPropertyFileManager(mockPropertyFileManager);
        unit.setEmailSenderConfig(mockEmailSenderConfig);

        mockMvc = MockMvcBuilders.standaloneSetup(unit).setHandlerExceptionResolvers(exceptionResolver).build();
    }

    @Test
    public void downloadFileById_successful() throws Exception
    {
        Long ecmFileId = 500L;
        String user = "user";
        String cmisId = "cmisId";
        String mimeType = "mimeType";
        String fileName = "fileName";
        String fileType = "fileType";
        String fileNameExtension = ".extension";

        Resource log4j = new ClassPathResource("/spring/spring-library-ecm-plugin-test-mule.xml");
        long log4jsize = log4j.getFile().length();
        InputStream log4jis = log4j.getInputStream();

        EcmFile fromDb = new EcmFile();
        fromDb.setFileId(ecmFileId);
        fromDb.setVersionSeriesId(cmisId);
        fromDb.setFileActiveVersionNameExtension(fileNameExtension);
        fromDb.setCmisRepositoryId("cmisRepositoryId");
        fromDb.setFileActiveVersionMimeType(mimeType);
        fromDb.setFileType(fileType);

        AcmContainer acmContainer = new AcmContainer();
        acmContainer.setContainerObjectId(1L);
        acmContainer.setContainerObjectType("DOC_REPO");
        fromDb.setContainer(acmContainer);

        Capture<EcmFileDownloadedEvent> capturedEvent = new Capture<>();

        expect(mockAuthentication.getName()).andReturn(user).atLeastOnce();
        expect(mockFileDao.find(ecmFileId)).andReturn(fromDb);
        expect(mockFolderAndFilesUtils.getVersionCmisId(fromDb, "")).andReturn(cmisId);
        expect(mockFolderAndFilesUtils.getVersion(fromDb, "")).andReturn(null);
        expect(mockMuleMessage.getPayload()).andReturn(mockContentStream).anyTimes();
        expect(mockContentStream.getMimeType()).andReturn(mimeType);
        expect(mockContentStream.getFileName()).andReturn(fileName);
        expect(fromDb.getFileActiveVersionNameExtension()).andReturn(fileNameExtension).anyTimes();
        expect(mockContentStream.getStream()).andReturn(log4jis);
        mockEventPublisher.publishEvent(capture(capturedEvent));
        expect(mockEmailSenderConfig.getConvertDocumentsToPdf()).andReturn(false);

        CMISCloudConnectorConnectionManager cmisConfig = new CMISCloudConnectorConnectionManager();
        expect(mockCmisConfigUtils.getCmisConfiguration(fromDb.getCmisRepositoryId())).andReturn(cmisConfig);
        Map<String, Object> messageProps = new HashMap<>();
        messageProps.put(EcmFileConstants.CONFIGURATION_REFERENCE, cmisConfig);
        expect(mockMuleContextManager.send("vm://downloadFileFlow.in", "cmisId", messageProps)).andReturn(mockMuleMessage);

        replayAll();
        MvcResult result = mockMvc.perform(
                get("/api/v1/plugin/ecm/download" + "?ecmFileId=" + ecmFileId).principal(mockAuthentication).session(mockHttpSession))
                .andReturn();

        verifyAll();

        EcmFileDownloadedEvent foundEvent = capturedEvent.getValue();
        assertEquals(ecmFileId, foundEvent.getObjectId());
        assertEquals("FILE", foundEvent.getObjectType());
        assertEquals(user, foundEvent.getUserId());
        assertEquals(acmContainer.getContainerObjectType(), foundEvent.getParentObjectType());
        assertEquals(acmContainer.getContainerObjectId(), foundEvent.getParentObjectId());

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentType().startsWith(mimeType));

        String returned = result.getResponse().getContentAsString();

        log.info("results: {}", returned);

        assertEquals(log4jsize, returned.length());
    }

    @Test
    public void downloadFileByIdAndVersion_successful() throws Exception
    {
        Long ecmFileId = 500L;
        String user = "user";
        String cmisId = "cmisId";
        String mimeType = "mimeType";
        String fileName = "fileName";
        String fileType = "fileType";
        String fileNameExtension = ".extension";
        String version = "2.0";

        Resource log4j = new ClassPathResource("/spring/spring-library-ecm-plugin-test-mule.xml");
        long log4jsize = log4j.getFile().length();
        InputStream log4jis = log4j.getInputStream();

        EcmFile fromDb = new EcmFile();
        fromDb.setFileId(ecmFileId);
        fromDb.setFileName(fileName);
        fromDb.setFileType(fileType);
        fromDb.setVersionSeriesId(cmisId);
        fromDb.setFileActiveVersionNameExtension(fileNameExtension);
        fromDb.setCmisRepositoryId("cmisRepositoryId");
        fromDb.setFileActiveVersionMimeType(mimeType);

        AcmContainer acmContainer = new AcmContainer();
        acmContainer.setContainerObjectId(1L);
        acmContainer.setContainerObjectType("DOC_REPO");
        fromDb.setContainer(acmContainer);

        EcmFileVersion ecmFileVersion = new EcmFileVersion();
        ecmFileVersion.setVersionTag(version);
        ecmFileVersion.setVersionMimeType(mimeType);
        ecmFileVersion.setVersionFileNameExtension(fileNameExtension);

        Capture<EcmFileDownloadedEvent> capturedEvent = new Capture<>();

        expect(mockAuthentication.getName()).andReturn(user).atLeastOnce();
        expect(mockFileDao.find(ecmFileId)).andReturn(fromDb);
        expect(mockFolderAndFilesUtils.getVersionCmisId(fromDb, version)).andReturn(cmisId);
        expect(mockFolderAndFilesUtils.getVersion(fromDb, version)).andReturn(ecmFileVersion);
        expect(mockMuleMessage.getPayload()).andReturn(mockContentStream).anyTimes();
        expect(mockContentStream.getMimeType()).andReturn(mimeType);
        expect(mockContentStream.getFileName()).andReturn(fileName);
        expect(ecmFileVersion.getVersionFileNameExtension()).andReturn(fileNameExtension).anyTimes();
        expect(mockContentStream.getStream()).andReturn(log4jis);
        expect(mockEmailSenderConfig.getConvertDocumentsToPdf()).andReturn(false);
        mockEventPublisher.publishEvent(capture(capturedEvent));

        CMISCloudConnectorConnectionManager cmisConfig = new CMISCloudConnectorConnectionManager();
        expect(mockCmisConfigUtils.getCmisConfiguration(fromDb.getCmisRepositoryId())).andReturn(cmisConfig);
        Map<String, Object> messageProps = new HashMap<>();
        messageProps.put(EcmFileConstants.CONFIGURATION_REFERENCE, cmisConfig);
        expect(mockMuleContextManager.send("vm://downloadFileFlow.in", "cmisId", messageProps)).andReturn(mockMuleMessage);

        replayAll();
        MvcResult result = mockMvc
                .perform(get("/api/v1/plugin/ecm/download" + "?ecmFileId={ecmFileId}&version={version}", ecmFileId, version)
                        .principal(mockAuthentication).session(mockHttpSession))
                .andReturn();

        verifyAll();

        EcmFileDownloadedEvent foundEvent = capturedEvent.getValue();
        assertEquals(ecmFileId, foundEvent.getObjectId());
        assertEquals("FILE", foundEvent.getObjectType());
        assertEquals(user, foundEvent.getUserId());
        assertEquals(acmContainer.getContainerObjectType(), foundEvent.getParentObjectType());
        assertEquals(acmContainer.getContainerObjectId(), foundEvent.getParentObjectId());

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentType().startsWith(mimeType));

        String returned = result.getResponse().getContentAsString();

        log.info("results: {}", returned);

        assertEquals(log4jsize, returned.length());

        // assert file metadata header
        JSONObject fileMetadata = new JSONObject(result.getResponse().getHeader("X-ArkCase-File-Metadata"));
        assertEquals(fileName, fileMetadata.getString("fileName"));
        assertEquals(fileType, fileMetadata.getString("fileType"));
    }

    @Test
    public void override_mime_type() throws Exception
    {
        Long ecmFileId = 500L;
        String user = "user";
        String cmisId = "cmisId";
        String mimeType = "mimeType";
        String fileName = "fileName";
        String fileType = "fileType";
        String fileNameExtension = ".extension";
        String tikaMimeType = "application/pdf";

        Resource log4j = new ClassPathResource("/spring/spring-library-ecm-plugin-test-mule.xml");
        long log4jsize = log4j.getFile().length();
        InputStream log4jis = log4j.getInputStream();

        EcmFile fromDb = new EcmFile();
        fromDb.setFileId(ecmFileId);
        fromDb.setVersionSeriesId(cmisId);
        fromDb.setFileActiveVersionNameExtension(fileNameExtension);
        fromDb.setCmisRepositoryId("cmisRepositoryId");
        fromDb.setFileActiveVersionMimeType(tikaMimeType);
        fromDb.setFileType(fileType);

        AcmContainer acmContainer = new AcmContainer();
        acmContainer.setContainerObjectId(1L);
        acmContainer.setContainerObjectType("DOC_REPO");
        fromDb.setContainer(acmContainer);

        Capture<EcmFileDownloadedEvent> capturedEvent = new Capture<>();

        expect(mockAuthentication.getName()).andReturn(user).atLeastOnce();
        expect(mockFileDao.find(ecmFileId)).andReturn(fromDb);
        expect(mockFolderAndFilesUtils.getVersionCmisId(fromDb, "")).andReturn(cmisId);
        expect(mockFolderAndFilesUtils.getVersion(fromDb, "")).andReturn(null);
        expect(mockMuleMessage.getPayload()).andReturn(mockContentStream).anyTimes();
        expect(mockContentStream.getMimeType()).andReturn(mimeType);
        expect(mockContentStream.getFileName()).andReturn(fileName);
        expect(fromDb.getFileActiveVersionNameExtension()).andReturn(fileNameExtension).anyTimes();
        expect(mockContentStream.getStream()).andReturn(log4jis);
        expect(mockEmailSenderConfig.getConvertDocumentsToPdf()).andReturn(false);
        mockEventPublisher.publishEvent(capture(capturedEvent));

        CMISCloudConnectorConnectionManager cmisConfig = new CMISCloudConnectorConnectionManager();
        expect(mockCmisConfigUtils.getCmisConfiguration(fromDb.getCmisRepositoryId())).andReturn(cmisConfig);
        Map<String, Object> messageProps = new HashMap<>();
        messageProps.put(EcmFileConstants.CONFIGURATION_REFERENCE, cmisConfig);
        expect(mockMuleContextManager.send("vm://downloadFileFlow.in", "cmisId", messageProps)).andReturn(mockMuleMessage);

        replayAll();
        MvcResult result = mockMvc.perform(
                get("/api/v1/plugin/ecm/download" + "?ecmFileId=" + ecmFileId).principal(mockAuthentication).session(mockHttpSession))
                .andReturn();

        verifyAll();

        EcmFileDownloadedEvent foundEvent = capturedEvent.getValue();
        assertEquals(ecmFileId, foundEvent.getObjectId());
        assertEquals("FILE", foundEvent.getObjectType());
        assertEquals(user, foundEvent.getUserId());
        assertEquals(acmContainer.getContainerObjectType(), foundEvent.getParentObjectType());
        assertEquals(acmContainer.getContainerObjectId(), foundEvent.getParentObjectId());

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentType().equals(tikaMimeType));

        String returned = result.getResponse().getContentAsString();

        log.info("results: " + returned);

        assertEquals(log4jsize, returned.length());
    }

    @Test
    public void downloadFileById_fileNotFoundInDb() throws Exception
    {
        Long ecmFileId = 500L;
        String user = "user";

        expect(mockAuthentication.getName()).andReturn(user).atLeastOnce();
        expect(mockFileDao.find(ecmFileId)).andReturn(null);

        replayAll();

        MvcResult result = mockMvc.perform(
                get("/api/v1/plugin/ecm/download" + "?ecmFileId=" + ecmFileId).principal(mockAuthentication).session(mockHttpSession))
                .andReturn();

        verifyAll();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), result.getResponse().getStatus());
    }
}
