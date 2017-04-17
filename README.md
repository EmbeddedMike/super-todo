# GTDflow a GTD workflow program
`GTDFlow` supports a smooth, efficient GTD workflow. Tasks flow from a category called `#IN` where new tasks arrive to a category `#Done` where completed tasks ends up. `GTDFlow` helps you keep your tasks organized and move them from group to group as you get them done.


## The template
`GTDFlow` organizes tasks and task groups in a text document in Markdown format. When you start out, `GTDFlow` gives you a blank template with these task categories (and possibly some others) defined.

```
# IN -- where you put new tasks
# Next -- a list of the next things to do, organized in contexts -- tasks that go together
# @phone -- context for phone calls
# @email -- context for emails
# @web  -- context for web tasks, other than email
# Waiting -- tasks depending on some external event
# Projects -- a main heading for a user defined projects
## SomeProject -- by convention, projects are tagged with two ##'s
# Someday -- project and tasks that may be done, some day
# Done -- a heading for tasks as they are completed

```

## The basic flow
You get stuff done by:
1. Writing things down in #IN. You write everything down so you don't forget anything.
2. Moving tasks from group to group so you can work on them efficiently.
3. Ultimately, marking them done and moving them to the #Done category.

#Category, tasks and tags
A category is a line of text that starts with a `#` character. Categories head groups of tasks.

A task is a line of text that starts with any character other than `#` 

A tag is a sequence of characters in a task line that starts with either a  `#` or `@` and continues to the next space character or end of line. Tags are case insensitive.

Categories group tasks. Tags tell `GTDFlow` how tasks should flow through categories as they are being worked on. 

# Creating new categories
You can create a new category in any of three ways. 

1. Wou can just add a category line anywhere in the document.
2. You can add a category line in the #IN section. When you do, `GTDFlow` will move the line to the top of the #Projects section
3. If you tag a task with a category that does not already exist and add a `!` chearacter `GTDFlow` will add the new category. 

### Examples
The lines:
```
# IN
# Documentation
```
will create a new category `# Documentation` in the `#Projects` section and remove it from the `#In` section.

The lines:
```
# IN
#@workshop
```
will create a new context in the `#Next` section and remove it from the `#In` section.

## Tagging tasks
A task line can have zero or more tags. Tags tell `GTDFlow` how to move tasks from section to section. `GTDFlow` will move tasks between sections based on the following rules:

### Tasks tagged #Done
When you've completed an item and tag it #Done the item will be moved to the #Done section. If this is the first task tagged #Done on a given date `GTDFlow` will create a new section for the day's date. 

Example: Supposing this is the first item completed on April 16, 2016, and it was completed at 8:30 Eastern Time 
```
Document `completing items` #Done
```
 GTDFlow will add the time to the item, and move it to the #Done section. The #Done section will look like this: 
```
# Done
## 2016.04.16
Document `completing items` -> 2016.04.16 08:30ET
```
### Tasks tagged with #Next or an @context
When a task is tagged with #Next or with a context (string beginning with `@`) the task will be moved to the corresponding section, if it exists. If it does not exist,the line will not be moved and the tag will have a `?` suffixed to it. If a tag has a `!` suffix and the section or context does not already exist, it will be created and the task moved.

Consider the lines:
```
Document #GTDFlow
@Phone Phil about tuesday 
```
Will be moved,Are both task lines because they don't start with a #. The first is tagged `#GTDFlow` so it will be moved to the #GTDFlow project if such a project exists. See below for how new tags get handled. The second is tagged @Phone, so it will be moved to the @phone context.

## New tags
Supposing you enter 
```
Organize #NewProject
```
and #NewProject doesn't already exist. GTD flow will let you know that it couldn't find #NewProject by changing the line, like this:
```
Organize #NewProject?
```
And positioning the cursor just following the ?. If you want to tell GTDFlow that #NewProject is a tag that you want to use, and not a typo, you delete the `?` and replace it with `!`

When you move off the line, GTDFlow will:

1. Create a new Project #NewProject under the #Projects heading
2. Remove the `!` from the line
3. Move the line below the #NewProject heading.


 





#Document
 If you type a section name in . When you move to another line, GTDFlow will take action based on any special symbols that you've typed.


