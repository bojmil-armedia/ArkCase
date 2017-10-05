package com.armedia.acm.objectdiff.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

public abstract class AcmChange implements Serializable
{
    private String action;
    private String path;

    public String getAction()
    {
        return action;
    }

    public void setAction(String action)
    {
        this.action = action;
    }

    public String getPath()
    {
        return path;
    }

    public void setPath(String path)
    {
        this.path = path;
    }

    @JsonIgnore
    public abstract boolean isLeaf();

    @Override
    public String toString()
    {
        return ToStringBuilder.reflectionToString(this);
    }
}
