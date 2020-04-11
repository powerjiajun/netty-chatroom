package com.cola.chat_server.model;

import java.io.Serializable;

public class User implements Serializable {

	private static final long serialVersionUID = -905636993551474335L;
	
	private String id;
	
	private String name;

	@Override
	public String toString() {
		return "User [id=" + id + ", name=" + name + "]";
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	

}
