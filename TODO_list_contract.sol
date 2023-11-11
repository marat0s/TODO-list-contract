// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract TodoList {
    struct TodoItem {
        string task;
        bool isCompleted;
        uint256 timestamp;
        address owner;
    }

    mapping (uint256 => TodoItem) public list;
    uint256 public count = 0;
    mapping (address => uint256[]) private userTasks;

    event TaskAdded(uint256 indexed id, address indexed owner);
    event TaskCompleted(uint256 indexed id);
    event TaskModified(uint256 indexed id, string newTask);
    event TaskDeleted(uint256 indexed id);

    function addTask(string calldata task) public {
        TodoItem memory item = TodoItem({
            task: task,
            isCompleted: false,
            timestamp: block.timestamp,
            owner: msg.sender
        });
        list[count] = item;
        userTasks[msg.sender].push(count);
        emit TaskAdded(count, msg.sender);
        count++;
    }

    function completeTask(uint256 id) public {
        require(list[id].owner == msg.sender, "Not task owner");
        if (!list[id].isCompleted) {
            list[id].isCompleted = true;
            emit TaskCompleted(id);
        }
    }

    function modifyTask(uint256 id, string calldata newTask) public {
        require(list[id].owner == msg.sender, "Not task owner");
        list[id].task = newTask;
        emit TaskModified(id, newTask);
    }

    function deleteTask(uint256 id) public {
        require(list[id].owner == msg.sender, "Not task owner");
        delete list[id];
        emit TaskDeleted(id);
    }

    function getTask(uint256 id) public view returns (TodoItem memory) {
        require(list[id].owner == msg.sender, "Not task owner");
        return list[id];
    }

    function getAllTasks() public view returns (TodoItem[] memory) {
        TodoItem[] memory tasks = new TodoItem[](userTasks[msg.sender].length);
        for (uint i = 0; i < userTasks[msg.sender].length; i++) {
            tasks[i] = list[userTasks[msg.sender][i]];
        }
        return tasks;
    }
}
